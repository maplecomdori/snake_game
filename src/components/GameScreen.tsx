import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Cell, Position, SnakeSegment, GameSpeed, GameConfig } from '../types';
import { SPEED_VALUES } from '../types';
import { getNextStep, pickTargetCell } from '../utils/pathfinding';
import { createGrid, getRandomSnakeStart, getUnrevealedCells, generateBombThreshold } from '../utils/gameLogic';
import './GameScreen.css';

interface GameScreenProps {
  config: GameConfig;
  onEndGame: (revealedCharacters: string[]) => void;
}

type Direction = 'up' | 'down' | 'left' | 'right';

function getDirection(from: Position, to: Position): Direction {
  if (to.col > from.col) return 'right';
  if (to.col < from.col) return 'left';
  if (to.row > from.row) return 'down';
  return 'up';
}

function clamp(v: number, max: number) { return Math.max(0, Math.min(max, v)); }

function getPositionBehind(
  snake: SnakeSegment[],
  rows: number,
  cols: number,
  direction: Direction,
): Position {
  const last = snake[snake.length - 1].position;
  const occupied = new Set(snake.map(s => `${s.position.row},${s.position.col}`));

  // Try a candidate; if it overlaps an existing segment, try perpendicular fallbacks
  const tryWithFallbacks = (dr: number, dc: number): Position => {
    const primary = { row: clamp(last.row + dr, rows - 1), col: clamp(last.col + dc, cols - 1) };
    if (!occupied.has(`${primary.row},${primary.col}`)) return primary;

    // Perpendicular fallbacks
    const perps = dc !== 0
      ? [{ row: last.row - 1, col: last.col }, { row: last.row + 1, col: last.col }]
      : [{ row: last.row, col: last.col - 1 }, { row: last.row, col: last.col + 1 }];
    for (const p of perps) {
      const clamped = { row: clamp(p.row, rows - 1), col: clamp(p.col, cols - 1) };
      if (!occupied.has(`${clamped.row},${clamped.col}`)) return clamped;
    }
    return primary; // all options exhausted, accept overlap
  };

  if (snake.length >= 2) {
    const prev = snake[snake.length - 2].position;
    return tryWithFallbacks(last.row - prev.row, last.col - prev.col);
  }

  // Single segment (head only) — place behind based on movement direction
  const deltas: Record<Direction, [number, number]> = {
    right: [0, -1], left: [0, 1], down: [-1, 0], up: [1, 0],
  };
  const [dr, dc] = deltas[direction];
  return tryWithFallbacks(dr, dc);
}

function getPupilOffset(dir: Direction): { x: number; y: number } {
  switch (dir) {
    case 'right': return { x: 25, y: 0 };
    case 'left': return { x: -25, y: 0 };
    case 'down': return { x: 0, y: 25 };
    case 'up': return { x: 0, y: -25 };
  }
}

export function GameScreen({ config, onEndGame }: GameScreenProps) {
  // ── state ──
  const [grid, setGrid] = useState<Cell[][]>(() => createGrid(config));
  const [snake, setSnake] = useState<SnakeSegment[]>([]);
  const [targetPos, setTargetPos] = useState<Position | null>(null);
  const [targetChar, setTargetChar] = useState<string | null>(null);
  const [isBomb, setIsBomb] = useState(false);
  const [paused, setPaused] = useState(false);
  const [snakeAte, setSnakeAte] = useState(false);
  const [speed, setSpeed] = useState<GameSpeed>(config.speed);
  const [showBanner, setShowBanner] = useState(true);
  const [revealedChars, setRevealedChars] = useState<string[]>([]);
  const [bombThreshold, setBombThreshold] = useState(() => generateBombThreshold());
  const [direction, setDirection] = useState<Direction>('right');
  const directionR = useRef<Direction>('right');
  const [cellSize, setCellSize] = useState(50);
  const [initialized, setInitialized] = useState(false);

  // ── refs (mirrors for game loop) ──
  const gridRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastStepTimeRef = useRef<number>(0);
  const gridR = useRef(grid);
  const snakeR = useRef(snake);
  const targetPosR = useRef(targetPos);
  const pausedR = useRef(paused);
  const speedR = useRef(speed);
  const isBombR = useRef(isBomb);
  const revealedR = useRef(revealedChars);
  const bombThreshR = useRef(bombThreshold);
  const snakeAteR = useRef(snakeAte);
  const endedRef = useRef(false);

  useEffect(() => { gridR.current = grid; }, [grid]);
  useEffect(() => { snakeR.current = snake; }, [snake]);
  useEffect(() => { targetPosR.current = targetPos; }, [targetPos]);
  useEffect(() => { pausedR.current = paused; }, [paused]);
  useEffect(() => { speedR.current = speed; }, [speed]);
  useEffect(() => { isBombR.current = isBomb; }, [isBomb]);
  useEffect(() => { revealedR.current = revealedChars; }, [revealedChars]);
  useEffect(() => { bombThreshR.current = bombThreshold; }, [bombThreshold]);
  useEffect(() => { snakeAteR.current = snakeAte; }, [snakeAte]);

  // ── cell sizing ──
  useEffect(() => {
    function compute() {
      const wrapper = gridRef.current?.parentElement;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const gap = 3;
      const pad = 6; // grid padding
      const availW = rect.width - 32;
      const availH = rect.height - 32;
      const cellW = Math.floor((availW - pad - (config.cols - 1) * gap) / config.cols);
      const cellH = Math.floor((availH - pad - (config.rows - 1) * gap) / config.rows);
      setCellSize(Math.max(24, Math.min(cellW, cellH, 120)));
    }
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, [config.rows, config.cols, showBanner]);

  // ── helpers ──
  const doEndGame = useCallback(() => {
    if (endedRef.current) return;
    endedRef.current = true;
    cancelAnimationFrame(animFrameRef.current);
    onEndGame(revealedR.current);
  }, [onEndGame]);

  const revealNext = useCallback((g: Cell[][], headPos: Position) => {
    const unrevealed = getUnrevealedCells(g);
    if (unrevealed.length === 0) { doEndGame(); return; }

    const tailLen = snakeR.current.length - 1;
    const shouldBomb = tailLen >= bombThreshR.current;

    if (shouldBomb) {
      const cell = pickTargetCell(headPos, unrevealed) ?? unrevealed[Math.floor(Math.random() * unrevealed.length)];
      setGrid(prev => {
        const next = prev.map(r => r.map(c => ({ ...c })));
        next[cell.row][cell.col].state = 'bomb';
        return next;
      });
      setTargetPos(cell);
      setTargetChar(null);
      setIsBomb(true);
    } else {
      const cell = pickTargetCell(headPos, unrevealed);
      if (!cell) { doEndGame(); return; }
      const ch = g[cell.row][cell.col].character!;
      setGrid(prev => {
        const next = prev.map(r => r.map(c => ({ ...c })));
        next[cell.row][cell.col].state = 'revealed';
        return next;
      });
      setTargetPos(cell);
      setTargetChar(ch);
      setIsBomb(false);
      setRevealedChars(prev => [...prev, ch]);
    }
  }, [doEndGame]);

  // ── init ──
  useEffect(() => {
    const startPos = getRandomSnakeStart(grid);
    const initSnake: SnakeSegment[] = [{ position: startPos }];
    setSnake(initSnake);
    snakeR.current = initSnake;
    setInitialized(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!initialized || snake.length === 0 || targetPos !== null) return;
    revealNext(grid, snake[0].position);
  }, [initialized]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── arrival handler ──
  const handleArrival = useCallback(() => {
    const target = targetPosR.current;
    const curSnake = snakeR.current;
    const curGrid = gridR.current;
    if (!target || curSnake.length === 0) return;

    if (isBombR.current) {
      // Bomb reached: revert cell to unrevealed, pause
      setGrid(prev => {
        const next = prev.map(r => r.map(c => ({ ...c })));
        next[target.row][target.col].state = 'unrevealed';
        return next;
      });
      setTargetPos(null);
      setTargetChar(null);
      setIsBomb(false);
      setSnakeAte(true);
      setPaused(true);
    } else {
      // Snake eats character
      const ch = curGrid[target.row][target.col].character!;
      setGrid(prev => {
        const next = prev.map(r => r.map(c => ({ ...c })));
        next[target.row][target.col].state = 'eaten';
        return next;
      });
      // Grow snake by 1 with the eaten character on the new tail segment
      const behindPos = getPositionBehind(curSnake, config.rows, config.cols, directionR.current);
      const grown = [...curSnake, { position: behindPos, character: ch }];
      setSnake(grown);
      snakeR.current = grown;

      setTargetPos(null);
      setTargetChar(null);
      setSnakeAte(true);
      setPaused(true);
    }
  }, []);

  // ── game loop ──
  useEffect(() => {
    if (!initialized) return;

    const step = () => {
      const curSnake = snakeR.current;
      const target = targetPosR.current;
      if (!target || curSnake.length === 0) return;

      const head = curSnake[0].position;
      if (head.row === target.row && head.col === target.col) {
        handleArrival();
        return;
      }

      // Build obstacle set from body segments (exclude tail tip — it moves away)
      const bodyObstacles = new Set<string>();
      for (let i = 1; i < curSnake.length - 1; i++) {
        bodyObstacles.add(`${curSnake[i].position.row},${curSnake[i].position.col}`);
      }

      const nextPos = getNextStep(head, target, config.rows, config.cols, bodyObstacles);
      const dir = getDirection(head, nextPos);
      setDirection(dir);
      directionR.current = dir;

      // Move: head → nextPos, each body segment → position of segment in front
      const newSnake: SnakeSegment[] = [{ position: nextPos }];
      for (let i = 1; i < curSnake.length; i++) {
        newSnake.push({
          position: { ...curSnake[i - 1].position },
          character: curSnake[i].character,
        });
      }
      setSnake(newSnake);
      snakeR.current = newSnake;

      // If now at target, handle arrival on next frame
      if (nextPos.row === target.row && nextPos.col === target.col) {
        handleArrival();
      }
    };

    const loop = (ts: number) => {
      if (pausedR.current) {
        lastStepTimeRef.current = ts;
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }
      if (!lastStepTimeRef.current) lastStepTimeRef.current = ts;

      const interval = 1000 / SPEED_VALUES[speedR.current];
      if (ts - lastStepTimeRef.current >= interval) {
        lastStepTimeRef.current = ts;
        step();
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [initialized, handleArrival]);

  // ── resume ──
  const handleResume = useCallback(() => {
    const curSnake = snakeR.current;
    const headPos = curSnake[0]?.position;
    if (!headPos) return;

    const newGrid = gridR.current.map(r => r.map(c => ({ ...c })));

    if (snakeAte) {
      // After snake ate or bomb: reset to size 1
      const resetSnake: SnakeSegment[] = [{ position: { ...headPos } }];
      setSnake(resetSnake);
      snakeR.current = resetSnake;
      setBombThreshold(generateBombThreshold());
      setSnakeAte(false);
    } else {
      // Teacher paused, student read successfully
      const target = targetPosR.current;
      if (target && newGrid[target.row]?.[target.col]) {
        const ch = newGrid[target.row][target.col].character;
        newGrid[target.row][target.col].state = 'eaten';
        if (ch) {
          const behindPos = getPositionBehind(curSnake, config.rows, config.cols, directionR.current);
          const grown = [...curSnake, { position: behindPos, character: ch }];
          setSnake(grown);
          snakeR.current = grown;
        }
      }
    }

    setGrid(newGrid);
    gridR.current = newGrid;
    setTargetPos(null);
    setTargetChar(null);
    setIsBomb(false);
    setPaused(false);

    // Reveal next after state settles
    requestAnimationFrame(() => {
      const hp = snakeR.current[0]?.position;
      if (hp) revealNext(gridR.current, hp);
    });
  }, [snakeAte, revealNext]);

  // ── keyboard ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      const k = e.key.toLowerCase();
      if (k === 'p' && !paused) setPaused(true);
      else if (k === 'r' && paused) handleResume();
      else if (k === 't') setShowBanner(b => !b);
      else if (k === 'f') {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [paused, handleResume]);

  // ── derived ──
  const tailChars = useMemo(() => snake.filter(s => s.character).map(s => s.character!), [snake]);
  const speedLevel = speed === 'slow' ? 1 : speed === 'medium' ? 2 : 3;
  const charFontSize = Math.max(14, cellSize * 0.55);
  const gap = 3;
  const pad = 3;
  const transitionMs = Math.round(1000 / SPEED_VALUES[speed] * 0.75);

  return (
    <div className="game-screen">
      {/* Top bar */}
      <div className="game-topbar">
        <div className="topbar-left">
          <button className="topbar-btn" onClick={() => {
            if (document.fullscreenElement) document.exitFullscreen();
            else document.documentElement.requestFullscreen();
          }}>
            ⛶ <span className="shortcut">F</span>
          </button>
          <button className="topbar-btn" onClick={() => setShowBanner(b => !b)}>
            {showBanner ? '◧' : '◻'} Banner <span className="shortcut">T</span>
          </button>
        </div>
        <div className="topbar-right">
          {!paused ? (
            <button className="topbar-btn" onClick={() => setPaused(true)}>
              ⏸ Pause <span className="shortcut">P</span>
            </button>
          ) : (
            <button className="topbar-btn" onClick={handleResume}>
              ▶ Resume <span className="shortcut">R</span>
            </button>
          )}
          <button className="topbar-btn topbar-btn-danger" onClick={() => doEndGame()}>
            End Game
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="game-main">
        <div className="game-grid-wrapper">
          <div className="game-grid-container" ref={gridRef}>
            <div
              className="game-grid"
              style={{
                gridTemplateColumns: `repeat(${config.cols}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${config.rows}, ${cellSize}px)`,
              }}
            >
              {grid.flatMap((row, r) =>
                row.map((cell, c) => (
                  <div
                    key={`${r}-${c}`}
                    className={`grid-cell grid-cell-${cell.state}${
                      cell.state === 'revealed' || cell.state === 'bomb' ? ' grid-cell-reveal-enter' : ''
                    }`}
                  >
                    {cell.state === 'revealed' && (
                      <span className="grid-cell-char" style={{ fontSize: charFontSize }}>
                        {cell.character}
                      </span>
                    )}
                    {cell.state === 'bomb' && (
                      <span className="grid-cell-bomb-icon" style={{ fontSize: charFontSize }}>💣</span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Snake overlay */}
            <div className="snake-layer">
              {snake.map((seg, i) => {
                const isHead = i === 0;
                const x = seg.position.col * (cellSize + gap) + pad;
                const y = seg.position.row * (cellSize + gap) + pad;
                const size = isHead ? cellSize * 0.85 : cellSize * 0.7;
                const off = (cellSize - size) / 2;
                const pupil = getPupilOffset(direction);

                return (
                  <div
                    key={i}
                    className={`snake-segment ${isHead ? 'snake-head' : `snake-body ${i % 2 === 0 ? 'snake-body-even' : 'snake-body-odd'}`}`}
                    style={{
                      width: size,
                      height: size,
                      left: x + off,
                      top: y + off,
                      transition: `left ${transitionMs}ms linear, top ${transitionMs}ms linear`,
                    }}
                  >
                    {isHead ? (
                      <div className="snake-face">
                        <div className="snake-eye snake-eye-left">
                          <div className="snake-pupil" style={{ transform: `translate(${pupil.x}%, ${pupil.y}%)` }} />
                        </div>
                        <div className="snake-eye snake-eye-right">
                          <div className="snake-pupil" style={{ transform: `translate(${pupil.x}%, ${pupil.y}%)` }} />
                        </div>
                        <div className="snake-mouth" />
                        <div className="snake-tongue" />
                      </div>
                    ) : seg.character ? (
                      <span className="snake-tail-char" style={{ fontSize: size * 0.5 }}>
                        {seg.character}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className={`game-banner${!showBanner ? ' game-banner-hidden' : ''}`}>
          <span className="banner-label">Target</span>
          {snakeAte && tailChars.length > 0 ? (
            <div className="banner-tail-chars">
              {tailChars.map((ch, i) => (
                <span key={i} className="banner-tail-char">{ch}</span>
              ))}
            </div>
          ) : isBomb ? (
            <span className="banner-bomb">💣</span>
          ) : targetChar ? (
            <span className="banner-character">{targetChar}</span>
          ) : (
            <span className="banner-character" style={{ opacity: 0.15 }}>?</span>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="game-bottombar">
        <div className="speed-indicator">
          Speed:
          {[1, 2, 3].map(i => (
            <div key={i} className={`speed-dot${i <= speedLevel ? ' active' : ''}`} />
          ))}
        </div>



        <div className="game-status">
          {revealedChars.length} / {config.selectedCharacters.length} characters
        </div>
      </div>

      {/* Pause overlay */}
      {paused && (
        <div className="pause-overlay">
          <div className="pause-panel">
            <div className="pause-title">
              {snakeAte ? '🐍 Oh no!' : '⏸ Paused'}
            </div>

            {snakeAte && (
              <div className="pause-ate-msg">
                {tailChars.length > 0
                  ? `Ask the student to read all ${tailChars.length} character${tailChars.length > 1 ? 's' : ''} on the tail!`
                  : 'The snake reached the target!'}
              </div>
            )}

            <div className="pause-speed">
              <span className="pause-speed-label">Speed</span>
              <div className="speed-pills">
                {(['slow', 'medium', 'fast'] as GameSpeed[]).map(s => (
                  <button
                    key={s}
                    className={`speed-pill ${speed === s ? 'active' : ''}`}
                    onClick={() => setSpeed(s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="pause-buttons">
              <button className="pause-btn pause-btn-resume" onClick={handleResume}>
                ▶ Resume <span className="shortcut" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>R</span>
              </button>
              <button className="pause-btn pause-btn-end" onClick={() => doEndGame()}>
                End Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
