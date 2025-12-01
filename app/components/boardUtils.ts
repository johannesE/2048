import { Board, Cell, BOARD_ROWS, BOARD_COLS } from './Game';

export interface MoveResult {
  newBoard: Board;
  changed: boolean;
}

/**
 * Adds a random tile (2 or 4) to a random empty cell on the board
 * Returns null if there are no empty cells
 */
export const addRandomTile = (board: Board): Board | null => {
  // Find all empty positions
  const emptyPositions: [number, number][] = [];
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      if (board[row][col] === null) {
        emptyPositions.push([row, col]);
      }
    }
  }

  // If no empty positions, return null
  if (emptyPositions.length === 0) {
    return null;
  }

  // Create a copy of the board
  const newBoard = board.map(row => [...row]);

  // Choose a random empty position and add a 2 or 4
  const randomIndex = Math.floor(Math.random() * emptyPositions.length);
  const [row, col] = emptyPositions[randomIndex];
  newBoard[row][col] = Math.random() < 0.5 ? 2 : 4;
  return newBoard;
};

/**
 * Slides and merges a single row to the left
 * Each tile can only merge ONCE per move
 */
export const slideRowLeft = (row: Cell[]): { row: Cell[]; changed: boolean } => {
  // Filter out null values to get non-empty tiles
  const nonEmpty = row.filter(cell => cell !== null);
  const result: Cell[] = [];
  let changed = false;
  let i = 0;

  while (i < nonEmpty.length) {
    const current = nonEmpty[i];
    const next = nonEmpty[i + 1];

    // Check if current and next tiles can merge
    if (current === next && current !== null) {
      // Merge tiles
      result.push(current * 2);
      i += 2; // Skip the next tile as it's been merged
      changed = true;
    } else {
      // No merge, just add the tile
      result.push(current);
      i += 1;
    }
  }

  // Fill the rest with nulls
  while (result.length < row.length) {
    result.push(null);
  }

  // Check if the row actually changed
  if (!changed) {
    changed = row.some((cell, idx) => cell !== result[idx]);
  }

  return { row: result, changed };
};

/**
 * Reverses a row (for right movement)
 */
export const reverseRow = (row: Cell[]): Cell[] => {
  return [...row].reverse();
};

/**
 * Transposes the board (swaps rows and columns)
 */
export const transposeBoard = (board: Board): Board => {
  const transposed: Board = [];
  for (let col = 0; col < BOARD_COLS; col++) {
    const newRow: Cell[] = [];
    for (let row = 0; row < BOARD_ROWS; row++) {
      newRow.push(board[row][col]);
    }
    transposed.push(newRow);
  }
  return transposed;
};

/**
 * Checks if two boards are equal
 */
export const boardsEqual = (board1: Board, board2: Board): boolean => {
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      if (board1[row][col] !== board2[row][col]) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Move Left: Slide all rows to the left
 */
export const moveLeft = (board: Board): MoveResult => {
  const newBoard: Board = [];
  let anyChanged = false;

  for (const row of board) {
    const { row: newRow, changed } = slideRowLeft(row);
    newBoard.push(newRow);
    if (changed) anyChanged = true;
  }

  return { newBoard, changed: anyChanged };
};

/**
 * Move Right: Reverse, slide left, reverse back
 */
export const moveRight = (board: Board): MoveResult => {
  const newBoard: Board = [];
  let anyChanged = false;

  for (const row of board) {
    const reversed = reverseRow(row);
    const { row: slidRow, changed } = slideRowLeft(reversed);
    const finalRow = reverseRow(slidRow);
    newBoard.push(finalRow);
    if (changed) anyChanged = true;
  }

  return { newBoard, changed: anyChanged };
};

/**
 * Move Up: Transpose, slide left, transpose back
 */
export const moveUp = (board: Board): MoveResult => {
  const transposed = transposeBoard(board);
  const { newBoard: movedBoard, changed } = moveLeft(transposed);
  const finalBoard = transposeBoard(movedBoard);

  return { newBoard: finalBoard, changed };
};

/**
 * Move Down: Transpose, slide right, transpose back
 */
export const moveDown = (board: Board): MoveResult => {
  const transposed = transposeBoard(board);
  const { newBoard: movedBoard, changed } = moveRight(transposed);
  const finalBoard = transposeBoard(movedBoard);

  return { newBoard: finalBoard, changed };
};

/**
 * Generic move function that handles all directions
 */
export const move = (board: Board, direction: 'left' | 'right' | 'up' | 'down'): MoveResult => {
  switch (direction) {
    case 'left':
      return moveLeft(board);
    case 'right':
      return moveRight(board);
    case 'up':
      return moveUp(board);
    case 'down':
      return moveDown(board);
    default:
      return { newBoard: board, changed: false };
  }
};

/**
 * Checks if the game is won (2048 tile exists on the board)
 */
export const hasWon = (board: Board): boolean => {
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      if (board[row][col] === 2048) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Checks if the board is full (no empty cells)
 */
const isBoardFull = (board: Board): boolean => {
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS; col++) {
      if (board[row][col] === null) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Checks if any adjacent tiles can merge
 */
const hasAdjacentMerge = (board: Board): boolean => {
  // Check horizontal adjacents
  for (let row = 0; row < BOARD_ROWS; row++) {
    for (let col = 0; col < BOARD_COLS - 1; col++) {
      if (board[row][col] !== null && board[row][col] === board[row][col + 1]) {
        return true;
      }
    }
  }

  // Check vertical adjacents
  for (let col = 0; col < BOARD_COLS; col++) {
    for (let row = 0; row < BOARD_ROWS - 1; row++) {
      if (board[row][col] !== null && board[row][col] === board[row + 1][col]) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Checks if the game is lost (board full and no valid moves)
 */
export const hasLost = (board: Board): boolean => {
  // If board is not full, game is not lost
  if (!isBoardFull(board)) {
    return false;
  }

  // If there are adjacent tiles that can merge, game is not lost
  return !hasAdjacentMerge(board);
};
