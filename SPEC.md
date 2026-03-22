# Snake Game — Complete Specification

## Overview

A Chinese character review game for 5–10 year old English-speaking students, inspired by the classic Nokia snake game. A Mandarin tutor controls the game on a laptop, displayed on a projector/TV for 1–12 students. The goal is fun, low-pressure character review — not competition.

---

## Tech Stack

- **Framework:** React (Vite)
- **Language:** TypeScript
- **Styling:** CSS (no UI library — custom styled)
- **Deployment:** Works locally (`npm run dev`) and deployable to Vercel/Netlify/GitHub Pages
- **Font:** KaiTi bundled as a web font with fallback chain (STKaiti, SimKai, serif)

---

## Screens & Flow

### 1. Setup Screen

The teacher configures the game before starting.

#### Character Selection (Tree with Checkboxes)
- Hierarchical tree view: **Grade → Unit → Lesson**
- Checkboxes at every level (checking a unit selects all its lessons)
- Partially-checked parent state when some children are selected
- After selecting lessons, show all selected characters in a flat editable pool:
  - Toggle individual characters on/off
  - Manual text input to add custom characters
  - "Select N random" button to auto-pick a specified count from the pool
  - Display total selected count prominently

#### Grid Configuration
- Input fields for rows (N) and columns (M), both minimum 5
- Grid cell count can be **greater than** the character count — extra cells stay empty, giving more spacing on the board
- **Validation:** If `N × M < selected character count`, show a warning — not all characters will fit. Teacher must either increase grid size or reduce characters.
- Grid preview showing the dimensions

#### Speed Control
- Speed selector: Slow / Medium / Fast (controls cells per second)
  - Slow: 0.5 cells/sec
  - Medium: 1 cell/sec (default)
  - Fast: 1.5 cells/sec

#### Start Game Button
- Disabled until valid configuration (at least 1 character selected, grid ≥ 5×5, grid can fit all selected characters)

### 2. Game Screen

Full game board with controls. Optimized for projector viewing.

#### Layout
```
Banner ON:                          Banner OFF (T to toggle):
┌────────────────────────────────┐  ┌────────────────────────────────┐
│ [⛶] [T]        [Pause] [End]  │  │ [⛶] [T]        [Pause] [End]  │
│                                │  │                                │
│ ┌──────────────┐ ┌──────────┐ │  │ ┌────────────────────────────┐ │
│ │              │ │          │ │  │ │                            │ │
│ │  N × M GRID  │ │  TARGET  │ │  │ │                            │ │
│ │              │ │ CHAR (大) │ │  │ │      N × M GRID (larger)  │ │
│ │              │ │          │ │  │ │                            │ │
│ └──────────────┘ └──────────┘ │  │ │                            │ │
│                                │  │ └────────────────────────────┘ │
│ Speed: ●●○  Tail: [花][生][麻] │  │ Speed: ●●○  Tail: [花][生][麻] │
└────────────────────────────────┘  └────────────────────────────────┘
```

#### Grid Cells
- **Unrevealed cell:** Empty (blank cell, no mouse, no character)
- **Revealed/target cell:** Shows the Chinese character in KaiTi font (black text) on the **front**, with the mouse image (`mouse_background.png`) as the **background** behind the character. This creates the visual of the snake coming for the mouse. Character must not be blocked by the mouse — character is foreground, mouse is background.
- **Eaten/consumed cell:** Empty (distinct subtle background, no mouse, no character)
- **Bomb cell:** Shows a bomb icon only (no mouse) on a previously empty cell
- **Cells without characters:** When the grid has more cells than characters, extra cells remain permanently empty

#### Target Character Banner
- Large display area beside the grid showing the currently targeted character
- Character displayed in large KaiTi font for projector readability
- **Toggle button** + keyboard shortcut `T` to show/hide the banner — when hidden, the grid expands to use the full width, making characters in cells larger for projector viewing
- When no target is active (between rounds, e.g., game just started or paused between rounds), the banner area is blank

#### Snake
- **Cute cartoon snake** with eyes and a friendly face on the head
- Body segments are rounded, colorful (green gradient)
- **Tail characters:** Each tail segment displays its carried character visibly
- **Smooth sliding animation** between cells
- Snake can **pass through its own body** (no self-collision)
- Snake does **NOT wrap** around grid edges — pathfinds within boundaries

#### Controls
- **Pause button** + keyboard shortcut `P`
- **Resume button** (shown when paused) + keyboard shortcut `R`
- **Fullscreen toggle** button
- **End Game** button

#### Pause Overlay (Control Panel)
When paused, a semi-transparent overlay appears with:
- **Resume** button (+ `R` shortcut reminder)
- **Speed adjustment** (Slow / Medium / Fast)
- **End Game** button
- The overlay must NOT block the grid — students should still see all characters through the overlay

### 3. Game Over / Review Screen

- **Character review grid:** All characters that were targeted during the game, displayed in large KaiTi font
- **Quick Restart** button — reshuffles same characters and grid
- **New Game** button — returns to setup screen

---

## Game Mechanics

### Character Placement
1. Selected characters are randomly assigned to grid cells (1 character per cell)
2. If the grid has more cells than characters, the extra cells remain permanently empty (no character assigned). This allows teachers to use larger grids for more spacing.
3. On game restart (Quick Restart), positions are reshuffled randomly

### Snake Initialization
- Snake starts at a random cell on the grid
- Initial size: 1 cell (head only)

### Target Character Selection
1. Pick an unrevealed character from cells that are **8–12 Manhattan distance** from the snake's head
2. If no cell is in that range, pick the unrevealed cell closest to 10 Manhattan distance
3. Randomize within qualifying candidates
4. **Never repeat** a character that has already been targeted
5. The selected cell transitions from **empty → character + mouse background** (character on front, mouse behind)
6. The character is also shown in the **large banner**

### Snake Movement
- Snake automatically pathfinds the **shortest Manhattan path** to the target cell
- Moves at the teacher-set speed (adjustable when paused)
- **Smooth sliding animation** between cells
- No grid wrapping — navigates within boundaries
- Can pass through its own tail segments

### Round Flow

#### Scenario A: Student Reads Successfully (before snake arrives)
1. Student reads the character aloud
2. Teacher presses `P` to pause
3. Teacher selects next student (verbally)
4. Teacher presses `R` to resume
5. On resume:
   - Target cell becomes **empty** (consumed)
   - Snake **grows +1** — the character is added to the end of the tail (visible on the tail segment)
   - A **new character is revealed** (flip animation)
   - Snake **redirects** to the new target (abandons old path)

#### Scenario B: Snake Eats the Character (student too slow)
1. Snake reaches the target cell
2. The character is added to the end of the tail
3. Target cell becomes **empty**
4. Game **auto-pauses**
5. **Second chance:** Teacher asks the student to read ALL characters currently on the tail
6. **If second chance succeeds:**
   - Teacher picks next student (verbally)
   - Teacher presses `R` to resume
   - All tail characters are cleared — **snake resets to size 1** at current head position
   - A new character is revealed
7. **If second chance fails:**
   - Game stays paused — **teacher decides** how to handle (verbally)
   - Teacher resumes when ready

#### Scenario C: Bomb Event
- **Trigger:** After the snake carries 4, 5, or 6 characters, there is an **equal chance** (1/3 each at 4, 5, or 6) that the next reveal is a bomb instead of a character
- **Bomb display:** A random unrevealed cell shows a **bomb icon** (no mouse, just the bomb) — the character underneath stays hidden
- Snake pathfinds to the bomb cell
- When snake **reaches the bomb:**
  1. Game **auto-pauses**
  2. Teacher asks student to read ALL characters on the tail
  3. **If successful:**
     - Bomb disappears
     - Teacher picks next student (verbally)
     - On resume: all tail characters cleared, **snake resets to size 1** at current head position, new character revealed
  4. **If failed:**
     - Game stays paused — teacher decides

### Game End
- **Auto-end:** When all characters have been targeted (no unrevealed cells remain)
- **Manual end:** Teacher clicks "End Game" at any time
- Transitions to the **Review Screen**

---

## Visual Design

### Color Scheme
- **Background:** Fixed light green (`#e8f5e9` or similar)
- **Grid cells (unrevealed):** Empty, light/white card
- **Grid cells (revealed/target):** Character text on front + mouse background image behind, highlighted border (gold/yellow pulse animation)
- **Grid cells (empty/eaten):** Subtle gray, no content
- **Chinese characters:** Black, KaiTi font
- **Snake:** Cute cartoon, green gradient body, friendly face on head
- **Bomb:** Classic round bomb with fuse icon

### Typography
- **Chinese characters:** KaiTi (bundled web font), large and readable on projector
- **UI text:** Clean sans-serif (system font stack)

### Animations
- **Reveal transition:** Smooth appearance animation when a cell is targeted (empty → character + mouse background)
- **Snake movement:** Smooth CSS/JS transition sliding between cells
- **Target highlight:** Gentle pulsing glow on the target cell
- **Bomb:** Subtle shake or pulse animation

### Responsiveness
- Primary target: laptop screen mirrored to projector (1920×1080 or similar)
- Grid cells should scale to fill available space while maintaining aspect ratio
- Fullscreen mode for clean projector display

---

## Data

### Word List (`word_list.json`)
```
grade → unit → lesson → character[]
```
- Grades: 1–4
- Each grade has 3 units
- Each unit has 4–8 lessons
- Each lesson has 9–32 characters

### No Persistence Required
- No database, no login, no saved state
- Each game session is independent

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `P` | Pause game |
| `R` | Resume game |
| `T` | Toggle target character banner |
| `F` | Toggle fullscreen (optional) |

---

## Edge Cases

1. **Grid larger than character count:** Extra cells stay permanently empty — no warning needed, this is valid
2. **Grid smaller than character count:** Warning shown, not all characters will be placed — teacher must adjust
3. **Very small grids (5×5 = 25 cells):** May limit lesson choices — warning system handles this
3. **No valid cell in 8–12 range:** Fall back to closest-to-10 unrevealed cell
4. **Only 1 unrevealed cell left:** Target it regardless of distance
5. **Snake at target position:** Immediately "eat" (0-distance edge case)
6. **All characters consumed:** Auto-end game
7. **Bomb when <4 tail characters:** Bomb only triggers at 4, 5, or 6 tail characters
8. **Multiple bombs in a row:** Possible if tail keeps reaching 4–6 after resets
9. **Teacher pauses during snake slide animation:** Snake stops at current cell boundary (snaps to nearest cell)
10. **Duplicate characters across lessons:** Allowed in the pool — teacher can manually remove duplicates

---

## Out of Scope

- Sound effects / music
- Student roster / score tracking
- Undo functionality
- Mobile/tablet optimization
- Multiplayer / networked play
- Pinyin display
- Save/load game state
