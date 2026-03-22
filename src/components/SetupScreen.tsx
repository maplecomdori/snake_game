import { useState, useMemo, useCallback } from 'react';
import type { GameConfig, GameSpeed } from '../types';
import './SetupScreen.css';

interface SetupScreenProps {
  wordList: any;
  onStartGame: (config: GameConfig) => void;
}

interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  characters?: string[];
}

function buildTree(wordList: any): TreeNode[] {
  const grades = wordList.grade || {};
  return Object.keys(grades).sort().map(g => ({
    id: `g${g}`,
    label: `Grade ${g}`,
    children: Object.keys(grades[g].unit || {}).sort().map(u => ({
      id: `g${g}-u${u}`,
      label: `Unit ${u}`,
      children: Object.keys(grades[g].unit[u].lesson || {}).sort((a, b) => +a - +b).map(l => ({
        id: `g${g}-u${u}-l${l}`,
        label: `Lesson ${l}`,
        characters: grades[g].unit[u].lesson[l] as string[],
      })),
    })),
  }));
}

function getAllLeafIds(node: TreeNode): string[] {
  if (node.characters) return [node.id];
  return (node.children || []).flatMap(getAllLeafIds);
}



export function SetupScreen({ wordList, onStartGame }: SetupScreenProps) {
  const tree = useMemo(() => buildTree(wordList), [wordList]);

  const [checkedLeaves, setCheckedLeaves] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deselectedChars, setDeselectedChars] = useState<Set<string>>(new Set());
  const [customChars, setCustomChars] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [randomCount, setRandomCount] = useState('');
  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(6);
  const [speed, setSpeed] = useState<GameSpeed>('slow');

  // Collect all chars from checked lessons
  const poolChars = useMemo(() => {
    const chars: string[] = [];
    function collect(nodes: TreeNode[]) {
      for (const n of nodes) {
        if (n.characters && checkedLeaves.has(n.id)) {
          chars.push(...n.characters);
        }
        if (n.children) collect(n.children);
      }
    }
    collect(tree);
    // Add custom chars
    chars.push(...customChars);
    // Deduplicate
    return [...new Set(chars)];
  }, [tree, checkedLeaves, customChars]);

  const selectedChars = useMemo(
    () => poolChars.filter(c => !deselectedChars.has(c)),
    [poolChars, deselectedChars]
  );

  const gridSize = rows * cols;
  const tooFewCells = gridSize < selectedChars.length;
  const canStart = selectedChars.length > 0 && rows >= 5 && cols >= 5 && !tooFewCells;

  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const toggleNode = useCallback((node: TreeNode) => {
    const leafIds = getAllLeafIds(node);
    setCheckedLeaves(prev => {
      const next = new Set(prev);
      const allChecked = leafIds.every(id => next.has(id));
      if (allChecked) {
        leafIds.forEach(id => next.delete(id));
      } else {
        leafIds.forEach(id => next.add(id));
      }
      return next;
    });
    setDeselectedChars(new Set());
  }, []);

  const getCheckState = useCallback((node: TreeNode): 'none' | 'partial' | 'checked' => {
    const leafIds = getAllLeafIds(node);
    const checked = leafIds.filter(id => checkedLeaves.has(id)).length;
    if (checked === 0) return 'none';
    if (checked === leafIds.length) return 'checked';
    return 'partial';
  }, [checkedLeaves]);

  const toggleChar = useCallback((char: string) => {
    setDeselectedChars(prev => {
      const next = new Set(prev);
      if (next.has(char)) next.delete(char); else next.add(char);
      return next;
    });
  }, []);

  const addCustomChar = useCallback(() => {
    const chars = customInput.trim().split('').filter(c => c.trim());
    if (chars.length > 0) {
      setCustomChars(prev => [...new Set([...prev, ...chars])]);
      setCustomInput('');
    }
  }, [customInput]);

  const selectRandom = useCallback(() => {
    const n = parseInt(randomCount);
    if (isNaN(n) || n <= 0 || poolChars.length === 0) return;
    const count = Math.min(n, poolChars.length);
    const shuffled = [...poolChars].sort(() => Math.random() - 0.5);
    const keep = new Set(shuffled.slice(0, count));
    setDeselectedChars(new Set(poolChars.filter(c => !keep.has(c))));
  }, [randomCount, poolChars]);

  const handleStart = () => {
    onStartGame({ selectedCharacters: selectedChars, rows, cols, speed });
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    const hasChildren = !!node.children?.length;
    const isExpanded = expanded.has(node.id);
    const checkState = getCheckState(node);

    return (
      <div key={node.id} className="tree-node">
        <div className="tree-row" onClick={() => hasChildren ? toggleExpand(node.id) : toggleNode(node)}>
          <span
            className={`tree-toggle ${isExpanded ? 'expanded' : ''} ${!hasChildren ? 'leaf' : ''}`}
            onClick={e => { e.stopPropagation(); if (hasChildren) toggleExpand(node.id); }}
          >
            ▶
          </span>
          <span
            className={`tree-checkbox ${checkState === 'checked' ? 'checked' : ''} ${checkState === 'partial' ? 'partial' : ''}`}
            onClick={e => { e.stopPropagation(); toggleNode(node); }}
          >
            {checkState === 'checked' && <span className="tree-checkbox-icon">✓</span>}
            {checkState === 'partial' && <span className="tree-checkbox-icon">—</span>}
          </span>
          <span className="tree-label">{node.label}</span>
          {node.characters && (
            <span style={{ fontSize: 12, color: 'var(--text-light)', marginLeft: 4 }}>
              ({node.characters.length})
            </span>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="tree-children">
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="setup-screen">
      <div className="setup-header">
        <h1 className="setup-title">Chinese Character Snake</h1>
        <p className="setup-subtitle">Select characters and configure the game</p>
      </div>

      <div className="setup-content">
        <div className="setup-panel setup-panel-left">
          <div className="panel-title">
            <span className="panel-title-icon">📚</span> Lessons
          </div>
          <div className="tree-scroll">
            {tree.map(node => renderNode(node))}
          </div>
        </div>

        <div className="setup-panel setup-panel-right">
          <div className="pool-section">
            <div className="panel-title">
              <span className="panel-title-icon">🀄</span> Character Pool
            </div>

            <div className="pool-toolbar">
              <span className="pool-count">
                <strong>{selectedChars.length}</strong> / {poolChars.length} selected
              </span>

              <div className="pool-input-group">
                <input
                  className="pool-input pool-input-char"
                  placeholder="Add..."
                  value={customInput}
                  onChange={e => setCustomInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomChar()}
                />
                <button className="pool-btn pool-btn-secondary" onClick={addCustomChar}>Add</button>
              </div>

              <div className="pool-input-group">
                <input
                  className="pool-input"
                  type="number"
                  placeholder="N"
                  min={1}
                  value={randomCount}
                  onChange={e => setRandomCount(e.target.value)}
                />
                <button className="pool-btn pool-btn-primary" onClick={selectRandom}>Random</button>
              </div>
            </div>

            <div className="pool-grid">
              {poolChars.map((char, i) => (
                <div
                  key={`${char}-${i}`}
                  className={`pool-char ${deselectedChars.has(char) ? 'deselected' : 'selected'}`}
                  onClick={() => toggleChar(char)}
                >
                  <span className="pool-char-text">{char}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="config-section">
            <div className="config-group">
              <span className="config-label">Grid Size</span>
              <div className="config-row">
                <input
                  className="config-input"
                  type="number"
                  min={5}
                  value={rows}
                  onChange={e => setRows(Math.max(5, +e.target.value || 5))}
                />
                <span className="config-x">×</span>
                <input
                  className="config-input"
                  type="number"
                  min={5}
                  value={cols}
                  onChange={e => setCols(Math.max(5, +e.target.value || 5))}
                />
              </div>
            </div>

            <div className="config-group">
              <span className="config-label">Speed</span>
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

            {tooFewCells && (
              <div className="config-warning">
                ⚠ Grid too small for {selectedChars.length} characters ({gridSize} cells)
              </div>
            )}

            <div className="start-btn-wrap">
              <button className="start-btn" disabled={!canStart} onClick={handleStart}>
                Start Game
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
