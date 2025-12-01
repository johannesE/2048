'use client';

import { useState, useEffect } from 'react';

type Cell = number | null;
type Board = Cell[][];

const BOARD_ROWS = 4;
const BOARD_COLS = 4;

// Initialize the board with random number of 2s placed at random positions
const initializeBoard = (): Board => {
  const newBoard: Board = Array(BOARD_ROWS).fill(null).map(() => Array(BOARD_COLS).fill(null));

  const availablePositions: [number, number][] = [];
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      availablePositions.push([row, col]);
    }
  }
  const tilesToPlace = Math.floor(Math.random() * availablePositions.length);

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

export default function Game() {
  const [board, setBoard] = useState<Board>([]);

  useEffect(() => {
    // Initialize board only on client side to avoid hydration mismatch
    // Math.random() produces different values on server vs client
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBoard(initializeBoard());
  }, []);

  // Get color for tile based on value
  const getTileColor = (value: number | null) => {
    if (!value) return '';

    const colors: Record<number, string> = {
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

    return colors[value] || 'bg-[#34495E] border-[#95A5A6]';
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-8 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#FF6B35] opacity-20 rotate-45 rounded-3xl"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-[#4ECDC4] opacity-20 -rotate-12 rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-[#FDC500] opacity-15 rotate-12"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-8xl font-black tracking-tighter mb-4 text-black relative">
            <span className="absolute -inset-2 bg-[#FDC500] -rotate-1 -z-10"></span>
            <span className="relative">2048</span>
          </h1>
          <p className="text-xl font-mono tracking-wider uppercase text-gray-700">
            Slide to combine • Reach 2048
          </p>
        </div>

        {/* Game Board */}
        <div className="relative">
          {/* Board shadow/border effect */}
          <div className="absolute -inset-3 bg-black -rotate-1 rounded-2xl"></div>
          <div className="absolute -inset-2 bg-[#4ECDC4] rotate-1 rounded-2xl"></div>

          <div className="relative bg-[#2C3E50] p-4 rounded-2xl shadow-2xl border-8 border-black">
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${BOARD_COLS}, minmax(0, 1fr))` }}>
              {board.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const key = `${rowIndex}-${colIndex}`;
                  const isEmpty = cell === null;

                  return (
                    <div
                      key={key}
                      className={`
                        w-24 h-24 rounded-xl
                        flex items-center justify-center
                        font-black text-4xl
                        border-4
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
        <div className="text-center max-w-md">
          <p className="text-lg font-mono text-gray-600 leading-relaxed">
            Use arrow keys to slide tiles. Combine matching numbers to create larger values!
          </p>
        </div>
      </div>

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
      `}</style>
    </div>
  );
}
