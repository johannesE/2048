'use client';

import { useState, useEffect, useCallback } from 'react';
import { move, addRandomTile, hasWon, hasLost } from './boardUtils';

export type Cell = number | null;
export type Board = Cell[][];
export type Direction = 'left' | 'right' | 'up' | 'down';
export type GameStatus = 'playing' | 'won' | 'lost';

export const BOARD_ROWS = 4;
export const BOARD_COLS = 4;

// Tile color mapping
const TILE_COLORS: Record<number, string> = {
  2: 'bg-[#FF6B35] border-[#FF8C42]',
  4: 'bg-[#F7931E] border-[#FFB142]',
  8: 'bg-[#FDC500] border-[#FFD93D]',
  16: 'bg-[#6BCF7F] border-[#8FE3A0]',
  32: 'bg-[#4ECDC4] border-[#71E3DB]',
  64: 'bg-[#4A90E2] border-[#6BA8F0]',
  128: 'bg-[#9B59B6] border-[#B67BCE]',
  256: 'bg-[#E74C3C] border-[#F06C60]',
  512: 'bg-[#E91E63] border-[#F44777]',
  1024: 'bg-[#9C27B0] border-[#BA68C8]',
  2048: 'bg-[#000000] border-[#FFD700]',
};

// Initialize the board with random number of 2s placed at random positions
export const initializeBoard = (): Board => {
  const newBoard: Board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));

  const availablePositions: [number, number][] = [];
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      availablePositions.push([row, col]);
    }
  }
  const tilesToPlace = Math.floor(Math.random() * (availablePositions.length + 1));

  // Randomly place the initial 2s
  for (let i = 0; i < tilesToPlace; i++) {
    if (availablePositions.length === 0) break;
    const randomIndex = Math.floor(Math.random() * availablePositions.length);
    const [row, col] = availablePositions[randomIndex];
    newBoard[row][col] = 2;
    // Remove this position from available positions
    availablePositions.splice(randomIndex, 1);
  }

  return newBoard;
};

// Direction button component
interface DirectionButtonProps {
  direction: Direction;
  onClick: (direction: Direction) => void;
}

const DIRECTION_ARROWS: Record<Direction, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

const DirectionButton = ({ direction, onClick }: DirectionButtonProps) => (
  <button
    onClick={() => onClick(direction)}
    className="w-16 h-16 bg-black text-white font-black text-2xl rounded-xl border-4 border-[#4ECDC4] hover:bg-[#4ECDC4] hover:text-black transition-all duration-200 active:scale-95"
    aria-label={`Move ${direction}`}
  >
    {DIRECTION_ARROWS[direction]}
  </button>
);

interface AISuggestion {
  move: Direction;
  reasoning: string;
}

export default function Game() {
  const [board, setBoard] = useState<Board>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string>('');
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  // Load API key from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('openai_api_key');
    if (stored) setApiKey(stored);
  }, []);

  // Initialize or restart the game
  const initGame = useCallback(() => {
    setBoard(initializeBoard());
    setGameStatus('playing');
    setAiSuggestion(null);
    setAiError('');
  }, []);

  useEffect(() => {
    // Initialize board only on client side to avoid hydration mismatch
    // Math.random() produces different values on server vs client
    // eslint-disable-next-line react-hooks/set-state-in-effect
    initGame();
  }, [initGame]);

  // Handle movement in a specific direction
  const handleMove = useCallback((direction: Direction) => {
    // Prevent moves if game is over
    if (gameStatus !== 'playing') return;

    setBoard((currentBoard) => {
      if (currentBoard.length === 0) return currentBoard;

      const { newBoard, changed } = move(currentBoard, direction);

      if (changed) {
        if (hasWon(newBoard)) {
          setGameStatus('won');
          return newBoard;
        }

        // TODO: check if this can be optimized to avoid double copying and returning null for the random tile. We already have the hasLost check
        const boardWithNewTile = addRandomTile(newBoard);
        const finalBoard = boardWithNewTile ?? newBoard;

        // Check lose condition after adding new tile
        if (hasLost(finalBoard)) {
          setGameStatus('lost');
        }

        return finalBoard;
      }

      return currentBoard;
    });
  }, [gameStatus]);

  // Keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        'ArrowLeft': 'left',
        'a': 'left',
        'A': 'left',
        'ArrowRight': 'right',
        'd': 'right',
        'D': 'right',
        'ArrowUp': 'up',
        'w': 'up',
        'W': 'up',
        'ArrowDown': 'down',
        's': 'down',
        'S': 'down',
      };

      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        handleMove(direction);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  // Get AI move suggestion
  const getAISuggestion = async () => {
    if (gameStatus !== 'playing') return;
    if (board.length === 0) return;

    setIsLoadingAI(true);
    setAiError('');
    setAiSuggestion(null);

    try {
      const response = await fetch('/api/suggest-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board,
          apiKey: apiKey || undefined  // Send user's API key if available
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 400) {
          // API key issue - prompt user to enter key
          setShowApiKeyInput(true);
        }
        throw new Error(data.error || 'Failed to get suggestion');
      }

      setAiSuggestion(data);
    } catch (error: any) {
      setAiError(error.message || 'Failed to get AI suggestion');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Save API key to localStorage
  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('openai_api_key', key);
    setShowApiKeyInput(false);
  };

  // Handle touch start for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  // Handle touch end for swipe gestures
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    const minSwipeDistance = 50;

    // Determine if horizontal or vertical swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        handleMove(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        handleMove(deltaY > 0 ? 'down' : 'up');
      }
    }

    setTouchStart(null);
  };

  // Get color for tile based on value
  const getTileColor = (value: number | null): string => {
    if (!value) return '';
    return TILE_COLORS[value] || 'bg-[#34495E] border-[#95A5A6]';
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 sm:p-8 relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#FF6B35] opacity-20 rotate-45 rounded-3xl"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-[#4ECDC4] opacity-20 -rotate-12 rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-[#FDC500] opacity-15 rotate-12"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-8 max-w-full">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-5xl sm:text-8xl font-black tracking-tighter mb-2 sm:mb-4 text-black relative">
            <span className="absolute -inset-1 sm:-inset-2 bg-[#FDC500] -rotate-1 -z-10"></span>
            <span className="relative">2048</span>
          </h1>
          <p className="text-sm sm:text-xl font-mono tracking-wider uppercase text-gray-700">
            Swipe or use arrows • Reach 2048
          </p>
        </div>

        {/* Game Board */}
        <div className="relative touch-none">
          {/* Board shadow/border effect */}
          <div className="absolute -inset-2 sm:-inset-3 bg-black -rotate-1 rounded-2xl"></div>
          <div className="absolute -inset-1 sm:-inset-2 bg-[#4ECDC4] rotate-1 rounded-2xl"></div>

          <div className="relative bg-[#2C3E50] p-2 sm:p-4 rounded-2xl shadow-2xl border-4 sm:border-8 border-black">
            <div className="grid gap-1.5 sm:gap-3" style={{ gridTemplateColumns: `repeat(${BOARD_COLS}, minmax(0, 1fr))` }}>
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const key = `${rowIndex}-${colIndex}`;
                  const isEmpty = cell === null;

                  return (
                    <div
                      key={key}
                      className={`
                        w-16 h-16 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl
                        flex items-center justify-center
                        font-black text-xl sm:text-4xl
                        border-2 sm:border-4
                        transition-all duration-300
                        ${isEmpty
                          ? 'bg-[#34495E] border-[#2C3E50]'
                          : `${getTileColor(cell)} text-white shadow-lg transform hover:scale-105 animate-tile-appear`
                        }
                      `}
                    >
                      {!isEmpty && (
                        <span className="drop-shadow-lg">
                          {cell}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center max-w-md px-4">
          <p className="text-sm sm:text-lg font-mono text-gray-600 leading-relaxed">
            <span className="sm:hidden">Swipe to move tiles!</span>
            <span className="hidden sm:inline">Use arrow keys, WASD, or swipe to slide tiles. Combine matching numbers!</span>
          </p>
        </div>

        {/* Control Buttons - Hidden on mobile since we have swipe */}
        <div className="hidden sm:flex flex-col items-center gap-3">
          <DirectionButton direction="up" onClick={handleMove} />
          <div className="flex gap-3">
            <DirectionButton direction="left" onClick={handleMove} />
            <DirectionButton direction="down" onClick={handleMove} />
            <DirectionButton direction="right" onClick={handleMove} />
          </div>
        </div>

        {/* AI Suggestion Section */}
        <div className="flex flex-col items-center gap-3 sm:gap-4 mt-2 sm:mt-4 w-full px-4">
          <button
            onClick={getAISuggestion}
            disabled={isLoadingAI || gameStatus !== 'playing'}
            className="px-4 sm:px-8 py-2 sm:py-3 bg-[#9B59B6] text-white font-black text-sm sm:text-lg rounded-xl border-2 sm:border-4 border-black hover:bg-[#B67BCE] transition-all duration-200 active:scale-95 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoadingAI ? (
              <>
                <span className="animate-spin">⚙️</span>
                <span className="hidden sm:inline">Thinking...</span>
              </>
            ) : (
              <>🤖 <span className="hidden sm:inline">Get </span>AI Suggestion</>
            )}
          </button>

          {aiSuggestion && (
            <div className="relative w-full max-w-sm">
              <div className="absolute -inset-1 sm:-inset-2 bg-black rotate-1 rounded-xl"></div>
              <div className="relative bg-[#9B59B6] p-3 sm:p-4 rounded-xl border-2 sm:border-4 border-black text-white">
                <p className="font-black text-base sm:text-xl mb-1 sm:mb-2">
                  Move: <span className="text-[#FFD93D]">{aiSuggestion.move.toUpperCase()}</span>
                </p>
                <p className="text-xs sm:text-sm font-mono">
                  {aiSuggestion.reasoning}
                </p>
              </div>
            </div>
          )}

          {aiError && (
            <div className="bg-[#E74C3C] p-2 sm:p-3 rounded-xl border-2 sm:border-4 border-black text-white w-full max-w-sm">
              <p className="font-black text-xs sm:text-sm">❌ {aiError}</p>
            </div>
          )}
        </div>

        {/* Restart Button */}
        <button
          onClick={initGame}
          className="mt-2 sm:mt-4 px-6 sm:px-8 py-2 sm:py-3 bg-[#FDC500] text-black font-black text-base sm:text-lg rounded-xl border-2 sm:border-4 border-black hover:bg-[#FFD93D] transition-all duration-200 active:scale-95 uppercase tracking-wider"
        >
          New Game
        </button>
      </div>

      {/* API Key Input Modal */}
      {showApiKeyInput && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full">
            <div className="absolute -inset-2 sm:-inset-3 bg-black rotate-2 rounded-2xl"></div>
            <div className="absolute -inset-1 sm:-inset-2 bg-[#9B59B6] -rotate-1 rounded-2xl"></div>

            <div className="relative bg-white p-4 sm:p-8 rounded-2xl border-4 sm:border-8 border-black w-full">
              <h3 className="text-2xl sm:text-3xl font-black mb-3 sm:mb-4 relative">
                <span className="absolute -inset-1 sm:-inset-2 bg-[#FFD93D] -rotate-1 -z-10 rounded-xl"></span>
                <span className="relative">OpenAI API Key</span>
              </h3>

              <p className="text-xs sm:text-sm font-mono mb-3 sm:mb-4 text-gray-700">
                To use AI suggestions, you need an OpenAI API key.
              </p>

              <div className="bg-yellow-50 border-2 sm:border-4 border-yellow-400 p-2 sm:p-3 rounded-lg mb-3 sm:mb-4">
                <p className="text-xs font-mono text-yellow-800">
                  ⚠️ Your key will be stored in your browser and sent directly to OpenAI. Never share your API key!
                </p>
              </div>

              <ol className="text-xs sm:text-sm font-mono mb-3 sm:mb-4 space-y-1 sm:space-y-2 text-gray-700">
                <li>1. Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-[#4ECDC4] font-bold underline break-all">platform.openai.com/api-keys</a></li>
                <li>2. Create a new API key</li>
                <li>3. Paste it below:</li>
              </ol>

              <input
                type="password"
                placeholder="sk-..."
                className="w-full p-2 sm:p-3 border-2 sm:border-4 border-black rounded-xl font-mono mb-3 sm:mb-4 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveApiKey(e.currentTarget.value);
                  }
                }}
              />

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement;
                    if (input?.value) {
                      saveApiKey(input.value);
                    }
                  }}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-[#9B59B6] text-white font-black text-sm sm:text-base rounded-xl border-2 sm:border-4 border-black hover:bg-[#B67BCE] transition-all duration-200 active:scale-95"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowApiKeyInput(false)}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 text-black font-black text-sm sm:text-base rounded-xl border-2 sm:border-4 border-black hover:bg-gray-400 transition-all duration-200 active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Banner */}
      {gameStatus !== 'playing' && (
        <div className="fixed top-4 sm:top-8 left-1/2 -translate-x-1/2 z-50 animate-slide-down px-4 max-w-full">
          <div className="relative">
            {/* Background layers for brutalist effect */}
            <div className="absolute -inset-2 sm:-inset-3 bg-black rotate-2 rounded-2xl"></div>
            <div className="absolute -inset-1 sm:-inset-2 bg-[#4ECDC4] -rotate-1 rounded-2xl"></div>

            <div className="relative bg-white px-6 sm:px-12 py-4 sm:py-8 rounded-2xl border-4 sm:border-8 border-black text-center shadow-2xl">
              <h2 className="text-3xl sm:text-5xl font-black mb-2 sm:mb-4 relative">
                <span className="absolute -inset-1 sm:-inset-2 bg-[#FDC500] -rotate-1 -z-10 rounded-xl"></span>
                <span className="relative">
                  {gameStatus === 'won' ? 'You Win!' : 'Game Over'}
                </span>
              </h2>

              <p className="text-sm sm:text-xl font-mono mb-4 sm:mb-6 text-gray-700">
                {gameStatus === 'won'
                  ? '🎉 You reached 2048!'
                  : '😔 No more moves available'}
              </p>

              <button
                onClick={initGame}
                className="px-6 sm:px-8 py-2 sm:py-3 bg-black text-white font-black text-base sm:text-lg rounded-xl border-2 sm:border-4 border-[#4ECDC4] hover:bg-[#4ECDC4] hover:text-black transition-all duration-200 active:scale-95 uppercase tracking-wider"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom styles */}
      <style jsx>{`
        @keyframes tile-appear {
          0% {
            transform: scale(0) rotate(-180deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(10deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        .animate-tile-appear {
          animation: tile-appear 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes slide-down {
          0% {
            transform: translateX(-50%) translateY(-150%);
            opacity: 0;
          }
          100% {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-down {
          animation: slide-down 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>
    </div>
  );
}
