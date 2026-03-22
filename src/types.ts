export type CellState = 'unrevealed' | 'revealed' | 'eaten' | 'bomb' | 'empty-permanent';

export interface Cell {
  row: number;
  col: number;
  character: string | null;
  state: CellState;
}

export interface Position {
  row: number;
  col: number;
}

export interface SnakeSegment {
  position: Position;
  character?: string;
}

export type GameSpeed = 'slow' | 'medium' | 'fast';

export const SPEED_VALUES: Record<GameSpeed, number> = {
  slow: 0.5,
  medium: 1,
  fast: 1.5,
};

export type GamePhase = 'setup' | 'playing' | 'paused' | 'review';

export interface WordListData {
  grade: Record<string, {
    unit: Record<string, {
      lesson: Record<string, string[]>;
    }>;
  }>;
}

export interface GameConfig {
  selectedCharacters: string[];
  rows: number;
  cols: number;
  speed: GameSpeed;
}
