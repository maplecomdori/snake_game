import type { Position } from '../types';

/**
 * BFS to find shortest path from `from` to `to`, avoiding obstacle cells.
 * Returns the first step along that path.
 * Falls back to greedy step if no obstacle-free path exists.
 */
export function getNextStep(
  from: Position,
  to: Position,
  rows?: number,
  cols?: number,
  obstacles?: Set<string>,
): Position {
  // If grid info provided, use BFS to route around obstacles
  if (rows !== undefined && cols !== undefined && obstacles && obstacles.size > 0) {
    const key = (r: number, c: number) => `${r},${c}`;
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const visited = new Set<string>();
    visited.add(key(from.row, from.col));
    // Each entry: [position, firstStep]
    const queue: Array<[Position, Position]> = [];

    for (const [dr, dc] of dirs) {
      const nr = from.row + dr;
      const nc = from.col + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      const k = key(nr, nc);
      // Allow stepping onto the target even if it's "occupied"
      if (obstacles.has(k) && !(nr === to.row && nc === to.col)) continue;
      if (nr === to.row && nc === to.col) return { row: nr, col: nc };
      visited.add(k);
      queue.push([{ row: nr, col: nc }, { row: nr, col: nc }]);
    }

    let idx = 0;
    while (idx < queue.length) {
      const [pos, firstStep] = queue[idx++];
      for (const [dr, dc] of dirs) {
        const nr = pos.row + dr;
        const nc = pos.col + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        const k = key(nr, nc);
        if (visited.has(k)) continue;
        if (obstacles.has(k) && !(nr === to.row && nc === to.col)) continue;
        if (nr === to.row && nc === to.col) return firstStep;
        visited.add(k);
        queue.push([{ row: nr, col: nc }, firstStep]);
      }
    }
    // No BFS path found — pick the best obstacle-free neighbor closest to target
    const freeNeighbors: Position[] = [];
    for (const [dr, dc] of dirs) {
      const nr = from.row + dr;
      const nc = from.col + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (!obstacles.has(key(nr, nc))) {
        freeNeighbors.push({ row: nr, col: nc });
      }
    }
    if (freeNeighbors.length > 0) {
      freeNeighbors.sort((a, b) => manhattanDistance(a, to) - manhattanDistance(b, to));
      return freeNeighbors[0];
    }
    // All neighbors blocked — fall through to greedy as last resort
  }

  // Greedy fallback (no obstacles provided, or completely boxed in)
  const dr = to.row - from.row;
  const dc = to.col - from.col;

  if (Math.abs(dc) >= Math.abs(dr)) {
    if (dc !== 0) return { row: from.row, col: from.col + Math.sign(dc) };
    if (dr !== 0) return { row: from.row + Math.sign(dr), col: from.col };
  } else {
    if (dr !== 0) return { row: from.row + Math.sign(dr), col: from.col };
    if (dc !== 0) return { row: from.row, col: from.col + Math.sign(dc) };
  }
  return from;
}

export function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function pickTargetCell(
  head: Position,
  unrevealedCells: Position[],
): Position | null {
  if (unrevealedCells.length === 0) return null;
  if (unrevealedCells.length === 1) return unrevealedCells[0];

  const inRange = unrevealedCells.filter(cell => {
    const dist = manhattanDistance(head, cell);
    return dist >= 8 && dist <= 12;
  });

  if (inRange.length > 0) {
    return inRange[Math.floor(Math.random() * inRange.length)];
  }

  const sorted = [...unrevealedCells].sort((a, b) => {
    return Math.abs(manhattanDistance(head, a) - 10) - Math.abs(manhattanDistance(head, b) - 10);
  });

  const bestDist = Math.abs(manhattanDistance(head, sorted[0]) - 10);
  const candidates = sorted.filter(
    cell => Math.abs(manhattanDistance(head, cell) - 10) === bestDist
  );

  return candidates[Math.floor(Math.random() * candidates.length)];
}
