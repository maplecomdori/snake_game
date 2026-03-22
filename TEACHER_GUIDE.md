# Chinese Character Snake Game — Teacher Guide

## Getting Started

### First-Time Setup

1. Make sure [Node.js](https://nodejs.org/) (version 20 or later) is installed on your computer
2. Open a terminal, navigate to the game folder, and install dependencies:
   ```
   cd /path/to/snake
   npm install
   ```

### Running the Game

1. In the terminal, start the game:
   ```
   npm run dev
   ```
2. Open the URL shown in the terminal (usually http://localhost:5173) in your browser (Chrome recommended)
3. If using a projector, connect your laptop first, then open the game
4. Press the **⛶** button or **F** key to go fullscreen for the best projector display
5. When you're done, press **Ctrl+C** in the terminal to stop the game

---

## Setting Up a Game

### Step 1: Select Characters

On the left panel, you'll see a tree of **Grade → Unit → Lesson**. Click the arrows to expand each level.

- **Select an entire unit or lesson** by clicking its checkbox
- **Mix and match** — check multiple lessons across different grades and units
- Partially-checked boxes (dash icon) mean some children are selected

### Step 2: Fine-Tune the Character Pool

The right panel shows all characters from your selected lessons.

- **Remove a character** — click on it to dim it (it won't be used in the game)
- **Add a custom character** — type it in the "Add..." box and press Enter or click Add
- **Pick a random subset** — enter a number in the box next to "Random" and click it (e.g., enter 15 to randomly pick 15 characters from the pool)

The counter at the top shows how many characters are selected.

### Step 3: Set Grid Size

Enter the number of **rows** and **columns** (minimum 5 each).

- The grid can be **larger** than your character count — extra cells stay empty, giving the snake more room to move
- If the grid is **too small** to fit all characters, a warning appears and you must adjust

### Step 4: Set Speed

Choose how fast the snake moves:

| Speed  | Cells per second | Think time (10 cells away) |
|--------|-----------------|---------------------------|
| Slow   | 0.5             | ~20 seconds               |
| Medium | 1.0             | ~10 seconds               |
| Fast   | 1.5             | ~7 seconds                |

**Tip:** Start with Slow or Medium for younger students. You can change speed during the game when paused.

### Step 5: Start

Click the green **Start Game** button.

---

## During the Game

### What You See

- **Grid** — mostly empty cells. When a character is chosen as the target, it appears in its cell with a mouse picture behind it and a golden glowing border
- **Snake** — a cute green snake with eyes that moves toward the target
- **Target Banner** (right side) — shows the current target character in large text
- **Bottom bar** — shows current speed, tail characters, and progress count

### How a Round Works

1. A character appears on the grid (with the mouse behind it)
2. The snake starts moving toward it
3. **Ask a student to read the character aloud before the snake reaches it**

### If the Student Reads Successfully

1. Press **P** (or click Pause) to stop the snake
2. Verbally choose the next student
3. Press **R** (or click Resume) to continue
4. The character gets added to the snake's tail, and a new character appears

### If the Snake Reaches the Character First

1. The game **pauses automatically** with a "🐍 Oh no!" message
2. The character is added to the snake's tail
3. **Give the student a second chance** — ask them to read ALL characters on the snake's tail
4. If they succeed, press **R** to resume — the snake resets to size 1 and tail clears
5. If they can't, handle it however you like (help them, move on, etc.), then press **R**

### Bomb Event

After the snake carries 4–6 characters, a **💣 bomb** may appear instead of a character.

1. The snake moves toward the bomb
2. When it arrives, the game **pauses automatically**
3. Ask the student to read ALL characters on the tail
4. If they succeed, press **R** — the bomb disappears, snake resets to size 1, and the game continues
5. Pick the next student and continue

---

## Controls

### Buttons (top bar)

| Button    | What it does                              |
|-----------|-------------------------------------------|
| ⛶         | Toggle fullscreen                        |
| Banner    | Show/hide the large target character panel |
| Pause     | Pause the game                            |
| Resume    | Resume the game (shown when paused)       |
| End Game  | End the game and go to the review screen  |

### Keyboard Shortcuts

| Key | Action                         |
|-----|--------------------------------|
| P   | Pause the game                 |
| R   | Resume the game                |
| T   | Toggle the target banner       |
| F   | Toggle fullscreen              |

**Tip:** Hide the banner (press **T**) to make the grid larger on the projector — the character is still visible in its grid cell.

### While Paused

A control panel appears where you can:
- **Resume** the game
- **Change speed** (Slow / Medium / Fast)
- **End the game** early

---

## When the Game Ends

The game ends when:
- All characters have been played, OR
- You click **End Game**

You'll see a **review screen** showing all the characters that were practiced. Use this to do a quick group review with your students.

From here you can:
- **Quick Restart** — play again with the same characters (positions reshuffled)
- **New Game** — go back to setup and choose different characters

---

## Tips for Teachers

- **Start slow** — use Slow speed and a small character set (10–15) for your first game
- **Bigger grid = more time** — a larger grid means the target is farther away, giving students more time to think
- **Use the pause freely** — there's no penalty for pausing. Take time to discuss characters, praise students, or give hints
- **Adjust speed on the fly** — if students are struggling, pause and switch to Slow. If it's too easy, switch to Fast
- **Hide the banner** for advanced students — they'll have to look at the smaller character in the grid cell
- **Mix lessons for review** — combine characters from multiple units for comprehensive review sessions
- **Use Quick Restart** to play multiple rounds quickly with the same character set
