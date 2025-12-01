import {
  slideRowLeft,
  reverseRow,
  transposeBoard,
  moveLeft,
  moveRight,
  moveUp,
  moveDown,
  move,
  addRandomTile,
} from './boardUtils';
import { Board, Cell } from './Game';

describe('Board Utils', () => {
  describe('slideRowLeft', () => {
    it('should merge adjacent equal tiles once', () => {
      const row: Cell[] = [2, 2, 2, null];
      const { row: result, changed } = slideRowLeft(row);
      expect(result).toEqual([4, 2, null, null]);
      expect(changed).toBe(true);
    });

    it('should merge all pairs when all tiles are equal', () => {
      const row: Cell[] = [2, 2, 2, 2];
      const { row: result, changed } = slideRowLeft(row);
      expect(result).toEqual([4, 4, null, null]);
      expect(changed).toBe(true);
    });

    it('should slide tiles without merging when different', () => {
      const row: Cell[] = [null, 8, null, 2];
      const { row: result, changed } = slideRowLeft(row);
      expect(result).toEqual([8, 2, null, null]);
      expect(changed).toBe(true);
    });

    it('should handle row with no changes', () => {
      const row: Cell[] = [2, 4, 8, 16];
      const { row: result, changed } = slideRowLeft(row);
      expect(result).toEqual([2, 4, 8, 16]);
      expect(changed).toBe(false);
    });

    it('should handle empty row', () => {
      const row: Cell[] = [null, null, null, null];
      const { row: result, changed } = slideRowLeft(row);
      expect(result).toEqual([null, null, null, null]);
      expect(changed).toBe(false);
    });

    it('should merge only once per move', () => {
      const row: Cell[] = [4, 4, 2, 2];
      const { row: result, changed } = slideRowLeft(row);
      expect(result).toEqual([8, 4, null, null]);
      expect(changed).toBe(true);
    });
  });

  describe('reverseRow', () => {
    it('should reverse a row', () => {
      const row: Cell[] = [2, 4, 8, 16];
      expect(reverseRow(row)).toEqual([16, 8, 4, 2]);
    });

    it('should handle row with nulls', () => {
      const row: Cell[] = [2, null, 4, null];
      expect(reverseRow(row)).toEqual([null, 4, null, 2]);
    });
  });

  describe('transposeBoard', () => {
    it('should transpose a 4x4 board', () => {
      const board: Board = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ];
      const expected: Board = [
        [1, 5, 9, 13],
        [2, 6, 10, 14],
        [3, 7, 11, 15],
        [4, 8, 12, 16],
      ];
      expect(transposeBoard(board)).toEqual(expected);
    });

    it('should handle board with nulls', () => {
      const board: Board = [
        [null, 2, null, 4],
        [null, null, null, null],
        [8, null, 16, null],
        [null, null, null, 32],
      ];
      const expected: Board = [
        [null, null, 8, null],
        [2, null, null, null],
        [null, null, 16, null],
        [4, null, null, 32],
      ];
      expect(transposeBoard(board)).toEqual(expected);
    });
  });

  describe('moveLeft', () => {
    it('should match example 1', () => {
      const board: Board = [
        [null, 8, 2, 2],
        [4, 2, null, 2],
        [null, null, null, null],
        [null, null, null, 2],
      ];
      const expected: Board = [
        [8, 4, null, null],
        [4, 4, null, null],
        [null, null, null, null],
        [2, null, null, null],
      ];
      const { newBoard, changed } = moveLeft(board);
      expect(newBoard).toEqual(expected);
      expect(changed).toBe(true);
    });

    it('should return changed=false when board does not change', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [null, null, null, null],
        [2, null, null, null],
        [4, 8, null, null],
      ];
      const { newBoard, changed } = moveLeft(board);
      expect(newBoard).toEqual(board);
      expect(changed).toBe(false);
    });
  });

  describe('moveRight', () => {
    it('should match example 2', () => {
      const board: Board = [
        [null, 8, 2, 2],
        [4, 2, null, 2],
        [null, null, null, null],
        [null, null, null, 2],
      ];
      const expected: Board = [
        [null, null, 8, 4],
        [null, null, 4, 4],
        [null, null, null, null],
        [null, null, null, 2],
      ];
      const { newBoard, changed } = moveRight(board);
      expect(newBoard).toEqual(expected);
      expect(changed).toBe(true);
    });

    it('should return changed=false when board does not change', () => {
      const board: Board = [
        [null, null, null, 2],
        [null, null, 4, 8],
        [null, null, null, null],
        [null, 2, 4, 8],
      ];
      const { newBoard, changed } = moveRight(board);
      expect(newBoard).toEqual(board);
      expect(changed).toBe(false);
    });
  });

  describe('moveUp', () => {
    it('should match example 3', () => {
      const board: Board = [
        [null, 8, 2, 2],
        [4, 2, null, 2],
        [null, null, null, null],
        [null, null, null, 2],
      ];
      const expected: Board = [
        [4, 8, 2, 4],
        [null, 2, null, 2],
        [null, null, null, null],
        [null, null, null, null],
      ];
      const { newBoard, changed } = moveUp(board);
      expect(newBoard).toEqual(expected);
      expect(changed).toBe(true);
    });

    it('should return changed=false when board does not change', () => {
      const board: Board = [
        [2, 4, 8, 16],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];
      const { newBoard, changed } = moveUp(board);
      expect(newBoard).toEqual(board);
      expect(changed).toBe(false);
    });
  });

  describe('moveDown', () => {
    it('should slide tiles down correctly', () => {
      const board: Board = [
        [null, 8, 2, 2],
        [4, 2, null, 2],
        [null, null, null, null],
        [null, null, null, 2],
      ];
      const expected: Board = [
        [null, null, null, null],
        [null, null, null, null],
        [null, 8, null, 2],
        [4, 2, 2, 4],
      ];
      const { newBoard, changed } = moveDown(board);
      expect(newBoard).toEqual(expected);
      expect(changed).toBe(true);
    });

    it('should merge tiles moving down', () => {
      const board: Board = [
        [2, null, null, null],
        [2, null, null, null],
        [4, null, null, null],
        [4, null, null, null],
      ];
      const expected: Board = [
        [null, null, null, null],
        [null, null, null, null],
        [4, null, null, null],
        [8, null, null, null],
      ];
      const { newBoard, changed } = moveDown(board);
      expect(newBoard).toEqual(expected);
      expect(changed).toBe(true);
    });
  });

  describe('move', () => {
    it('should call moveLeft for left direction', () => {
      const board: Board = [
        [null, 2, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];
      const { newBoard, changed } = move(board, 'left');
      expect(newBoard[0]).toEqual([2, null, null, null]);
      expect(changed).toBe(true);
    });

    it('should call moveRight for right direction', () => {
      const board: Board = [
        [null, 2, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];
      const { newBoard, changed } = move(board, 'right');
      expect(newBoard[0]).toEqual([null, null, null, 2]);
      expect(changed).toBe(true);
    });

    it('should call moveUp for up direction', () => {
      const board: Board = [
        [null, null, null, null],
        [2, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];
      const { newBoard, changed } = move(board, 'up');
      expect(newBoard[0][0]).toBe(2);
      expect(changed).toBe(true);
    });

    it('should call moveDown for down direction', () => {
      const board: Board = [
        [2, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];
      const { newBoard, changed } = move(board, 'down');
      expect(newBoard[3][0]).toBe(2);
      expect(changed).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple merges in a row', () => {
      const row: Cell[] = [2, 2, 4, 4];
      const { row: result, changed } = slideRowLeft(row);
      expect(result).toEqual([4, 8, null, null]);
      expect(changed).toBe(true);
    });

    it('should not merge three consecutive tiles into one', () => {
      const row: Cell[] = [2, 2, 2, null];
      const { row: result } = slideRowLeft(row);
      expect(result).toEqual([4, 2, null, null]);
    });

    it('should handle row with single tile', () => {
      const row: Cell[] = [null, null, 2, null];
      const { row: result, changed } = slideRowLeft(row);
      expect(result).toEqual([2, null, null, null]);
      expect(changed).toBe(true);
    });
  });

  describe('addRandomTile', () => {
    it('should add a tile (2 or 4) to an empty cell', () => {
      const board: Board = [
        [2, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const newBoard = addRandomTile(board);
      expect(newBoard).not.toBeNull();

      // Count tiles
      const originalCount = board.flat().filter(c => c !== null).length;
      const newCount = newBoard!.flat().filter(c => c !== null).length;
      expect(newCount).toBe(originalCount + 1);
    });

    it('should only add 2 or 4', () => {
      const board: Board = [
        [2, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      // Test multiple times to check randomness
      for (let i = 0; i < 20; i++) {
        const newBoard = addRandomTile(board);
        const allTiles = newBoard!.flat().filter(c => c !== null);
        allTiles.forEach(tile => {
          expect([2, 4]).toContain(tile);
        });
      }
    });

    it('should return null when board is full', () => {
      const board: Board = [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2],
      ];

      const newBoard = addRandomTile(board);
      expect(newBoard).toBeNull();
    });

    it('should not modify the original board', () => {
      const board: Board = [
        [2, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const originalCopy = board.map(row => [...row]);
      addRandomTile(board);

      // Original board should be unchanged
      expect(board).toEqual(originalCopy);
    });

    it('should place tile at a random empty position', () => {
      const board: Board = [
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null],
      ];

      const positions = new Set<string>();

      // Run multiple times to test randomness
      for (let i = 0; i < 30; i++) {
        const newBoard = addRandomTile(board);

        // Find the position of the new tile
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 4; col++) {
            if (newBoard![row][col] !== null) {
              positions.add(`${row},${col}`);
            }
          }
        }
      }

      // Should have placed tiles in multiple different positions
      expect(positions.size).toBeGreaterThan(5);
    });

    it('should work with only one empty cell', () => {
      const board: Board = [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, null, 2],
      ];

      const newBoard = addRandomTile(board);
      expect(newBoard).not.toBeNull();
      expect(newBoard![3][2]).not.toBeNull();
      expect([2, 4]).toContain(newBoard![3][2]);
    });
  });
});
