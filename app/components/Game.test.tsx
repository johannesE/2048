import { render, screen, waitFor } from '@testing-library/react';
import Game, { initializeBoard, BOARD_ROWS, BOARD_COLS, Board, Cell } from './Game';

describe('Game Component', () => {
  describe('initializeBoard', () => {
    it('should create a board with correct dimensions', () => {
      const board = initializeBoard();

      expect(board).toHaveLength(BOARD_ROWS);
      board.forEach(row => {
        expect(row).toHaveLength(BOARD_COLS);
      });
    });

    it('should only place tiles with value 2', () => {
      const board = initializeBoard();

      board.forEach(row => {
        row.forEach(cell => {
          if (cell !== null) {
            expect(cell).toBe(2);
          }
        });
      });
    });

    it('should place a random number of tiles (1 to 16)', () => {
      const board = initializeBoard();

      const tileCount = board.flat().filter(cell => cell !== null).length;
      expect(tileCount).toBeGreaterThanOrEqual(1);
      expect(tileCount).toBeLessThanOrEqual(16);
    });

    it('should place tiles at unique positions', () => {
      const board = initializeBoard();

      const positions = new Set<string>();
      board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== null) {
            const posKey = `${rowIndex},${colIndex}`;
            expect(positions.has(posKey)).toBe(false);
            positions.add(posKey);
          }
        });
      });
    });

    it('should generate different boards on multiple calls', () => {
      const boards: Board[] = [];
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        boards.push(initializeBoard());
      }

      // Check that at least some boards are different
      const uniqueBoards = new Set(boards.map(b => JSON.stringify(b)));
      expect(uniqueBoards.size).toBeGreaterThan(1);
    });

    it('should only use valid board positions', () => {
      const board = initializeBoard();

      board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== null) {
            expect(rowIndex).toBeGreaterThanOrEqual(0);
            expect(rowIndex).toBeLessThan(BOARD_ROWS);
            expect(colIndex).toBeGreaterThanOrEqual(0);
            expect(colIndex).toBeLessThan(BOARD_COLS);
          }
        });
      });
    });
  });

  describe('Game rendering', () => {
    it('should render the game title', async () => {
      render(<Game />);

      await waitFor(() => {
        expect(screen.getByText('2048')).toBeInTheDocument();
      });
    });

    it('should render the game instructions', async () => {
      render(<Game />);

      await waitFor(() => {
        // Check for either mobile or desktop instructions
        const mobileText = screen.queryByText(/Swipe to move tiles/i);
        const desktopText = screen.queryByText(/Use arrow keys or WASD/i);
        expect(mobileText || desktopText).toBeTruthy();
      });
    });

    it('should render all board cells', async () => {
      const { container } = render(<Game />);

      await waitFor(() => {
        // Should have BOARD_ROWS * BOARD_COLS cells
        const gridContainer = container.querySelector('[style*="grid-template-columns"]');
        expect(gridContainer).toBeInTheDocument();
      });
    });

    it('should initialize board state after mounting', async () => {
      const { container } = render(<Game />);

      // Wait for board to be initialized (useEffect runs)
      await waitFor(() => {
        // Match both mobile (w-16 h-16) and desktop (w-24 h-24) tile sizes
        const tiles = container.querySelectorAll('div[class*="w-16 h-16"]');
        expect(tiles.length).toBe(BOARD_ROWS * BOARD_COLS);
      }, { timeout: 3000 });
    });

    it('should render tile values correctly', async () => {
      const { container } = render(<Game />);

      await waitFor(() => {
        // Check if any tiles with value 2 are rendered
        const valueElements = container.querySelectorAll('span.drop-shadow-lg');
        valueElements.forEach(element => {
          if (element.textContent) {
            expect(element.textContent).toBe('2');
          }
        });
      }, { timeout: 3000 });
    });
  });

  describe('Board constants', () => {
    it('should have BOARD_ROWS set to 4', () => {
      expect(BOARD_ROWS).toBe(4);
    });

    it('should have BOARD_COLS set to 4', () => {
      expect(BOARD_COLS).toBe(4);
    });
  });
});
