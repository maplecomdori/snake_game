import type { Cell, Position, GameConfig } from '../types';

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createGrid(config: GameConfig): Cell[][] {
  const { rows, cols, selectedCharacters } = config;
  const grid: Cell[][] = [];

  const positions: Position[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push({ row: r, col: c });
    }
  }
  const shuffledPositions = shuffleArray(positions);

  for (let r = 0; r < rows; r++) {
    grid[r] = [];
    for (let c = 0; c < cols; c++) {
      grid[r][c] = { row: r, col: c, character: null, state: 'empty-permanent' };
    }
  }

  const chars = shuffleArray(selectedCharacters);
  for (let i = 0; i < Math.min(chars.length, shuffledPositions.length); i++) {
    const pos = shuffledPositions[i];
    grid[pos.row][pos.col] = { row: pos.row, col: pos.col, character: chars[i], state: 'unrevealed' };
  }

  return grid;
}

export function getRandomSnakeStart(grid: Cell[][]): Position {
  const emptyCells: Position[] = [];
  const allCells: Position[] = [];

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      allCells.push({ row: r, col: c });
      if (grid[r][c].state === 'empty-permanent') {
        emptyCells.push({ row: r, col: c });
      }
    }
  }

  const pool = emptyCells.length > 0 ? emptyCells : allCells;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getUnrevealedCells(grid: Cell[][]): Position[] {
  const cells: Position[] = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c].state === 'unrevealed' && grid[r][c].character) {
        cells.push({ row: r, col: c });
      }
    }
  }
  return cells;
}

export function generateBombThreshold(): number {
  return 4 + Math.floor(Math.random() * 3);
}
