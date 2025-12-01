2048 (https://play2048.co) is an interesting game, why not make our own? Please follow the requirements below and create your own invention.


1. Generate an initial board with a random number of `2`s at random cells, e.g.:
```json
[
    [2, null, 2, null],
    [null, 2, null, 2],
    [2, null, 2, null],
    [null, 2, null, 2]
]
```

2. Support *Move Left* on the board. E.g.:

Before:
```json
[
    [null, 8, 2, 2],
    [4, 2, null, 2],
    [null, null, null, null],
    [null, null, null, 2]
]
```
After Move Left:
```json
[
    [8, 4, null, null],
    [4, 4, null, null],
    [null, null, null, null],
    [2, null, null, null]
]
```

3. Support *Move Right*. E.g.:

Before:
```json
[
    [null, 8, 2, 2],
    [4, 2, null, 2],
    [null, null, null, null],
    [null, null, null, 2]
]
```
After Move Right:
```json
[
    [null, null, 8, 4],
    [null, null, 4, 4],
    [null, null, null, null],
    [null, null, null, 2]
]
```

4. Support *Move Up* and *Move Down*. E.g.:

Before:
```json
[
    [null, 8, 2, 2],
    [4, 2, null, 2],
    [null, null, null, null],
    [null, null, null, 2]
]
```
After Merge Up:
```json
[
    [4, 8, 2, 4],
    [null, 2, null, 2],
    [null, null, null, null],
    [null, null, null, null]
]
```

5. Generate a `2` or `4` at a random empty space after each valid move that changes the board. E.g.:

Before:
```json
[
    [null, 8, 2, 2],
    [4, 2, null, 2],
    [null, null, null, null],
    [null, null, null, 2]
]
```
After Move Up and adding a new 2 or 4:
```json
[
    [4, 8, 2, 4],
    [null, 2, null, 2],
    [null, null, null, null],
    [2, null, null, null]
]
```

5. Determine endgame condition (Lose or Win). E.g.:

No more moves (Lose):
```json
[
    [2,4,2,4],
    [4,2,4,2],
    [2,4,2,4],
    [4,2,4,2]
]
```

Or, we've reached the goal of 2048 (Win):
```json
[
    [4, null, null, 2],
    [2048, null, null, null],
    [4, 2, null, null],
    [4, null, null, null]
]
```

6. AI Suggestion. During a gameplay, allow players to ask for the best possible move from an AI model to avoid gameover and maximize the chance of winning the game. You can use an offline AI model or connect with a remote AI server. Please do not submit with any credentials.

Remarks:
- Any programming language is welcome.
- You may make reasonable assumptions and clearly state them if anything is not explicitly mentioned above.
- The goal is to create a well-structured and maintainable codebase. Don't overthink the task or worry about performance.
- A very basic user interface would be appreciated. However, adding extra features to the game will not earn additional credit.
- The requirements may deviate from the original 2048 game. In case of any conflict, priority should be given to the former.

---

## Implementation Evaluation

### ✅ Requirements Met:

**1. Generate initial board with random number of 2s** ✅
- Implemented in `initializeBoard()` - generates 0-16 random 2s at random positions

**2. Support Move Left** ✅
- Tested with exact example from instructions
- Test passes: `moveLeft` test matches the example output

**3. Support Move Right** ✅
- Tested with exact example from instructions
- Test passes: `moveRight` test matches the example output

**4. Support Move Up and Move Down** ✅
- Tested with exact example from instructions
- Test passes: `moveUp` test matches the example output

**5. Generate 2 or 4 after valid moves** ✅
- Implemented in `addRandomTile()`
- Only adds tile when board changes
- Randomly generates 2 or 4

**6. Determine endgame (Win/Lose)** ✅
- Win: `hasWon()` checks for 2048 tile
- Lose: `hasLost()` checks for full board + no valid moves

**7. AI Suggestion** ✅
- Implemented with OpenAI API
- No credentials committed (uses .env.local, gitignored)

### ⚠️ Potential Issues:

**1. Over-engineered UI**
The instructions state:
> "A very basic user interface would be appreciated. However, adding extra features to the game will not earn additional credit."

Current implementation has:
- Elaborate Memphis/Brutalist design
- Custom fonts (Archivo Black, Courier Prime)
- Complex animations
- Layered borders with rotations
- Decorative background patterns

**The instructions suggest a "very basic UI"** - the current design is significantly more complex than required.

**2. Extra Features**
The instructions warn that extra features don't earn credit. We added:
- Sophisticated visual design system
- Multiple color schemes for tiles
- Hover effects and animations
- Restart button with styling
- Game over banner with animations

### Summary:

**Core Functionality:** ✅ 100% complete - all game logic requirements met exactly as specified

**UI Complexity:** ⚠️ Significantly exceeds "very basic" requirement - may be over-engineered for interview purposes

The game works perfectly and passes all tests, but the UI might be more elaborate than what was asked for in the instructions.
