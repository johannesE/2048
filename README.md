# 2048 Game with AI Suggestions

A modern implementation of the classic 2048 puzzle game built with Next.js, featuring AI-powered move suggestions using OpenAI's ChatGPT.

## Features

- 🎮 Classic 2048 gameplay with smooth animations
- 🎨 Unique Memphis/Brutalist visual design
- ⌨️ Keyboard controls (Arrow keys & WASD)
- 🖱️ Mouse/touch controls with directional buttons
- 🤖 AI move suggestions powered by ChatGPT
- 🏆 Win/lose detection
- 📱 Fully responsive design

## Getting Started

### Prerequisites

- Node.js 18+ or compatible runtime
- pnpm, npm, or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
# or
npm install
# or
yarn install
```

3. Run the development server:

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## AI Suggestions Setup

The game includes an optional AI feature that suggests the best move using OpenAI's ChatGPT.

### Option 1: Using .env.local (Recommended)

1. Copy the example environment file:
```bash
cp .env.example .env.local
```

2. Get your OpenAI API key:
   - Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-`)

3. Add your API key to `.env.local`:
```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

4. Restart the development server

### Option 2: Frontend API Key Input

If you don't have a `.env.local` file:

1. Click the "🤖 Get AI Suggestion" button in the game
2. When prompted, paste your OpenAI API key
3. The key will be securely stored in your browser's localStorage

**Security Note:** Your API key is stored locally and sent directly to OpenAI's API. Never commit your `.env.local` file or share your API key.

### API Costs

The AI feature uses the `gpt-4o-mini` model, which is very affordable:
- Average cost per suggestion: ~$0.0001-0.0005
- Perfect for casual use

## How to Play

### Controls
- **Arrow Keys** or **WASD**: Move tiles
- **Mouse/Touch**: Click directional buttons
- **New Game Button**: Start a fresh game
- **AI Suggestion**: Get ChatGPT's recommended move

### Game Rules
1. Tiles slide in the chosen direction until blocked
2. Tiles with the same number merge when they touch (2+2=4, 4+4=8, etc.)
3. Each tile can only merge once per move
4. A new tile (2 or 4) appears after each valid move
5. **Win**: Create a 2048 tile
6. **Lose**: Board is full with no valid moves

## Testing

Run the test suite:

```bash
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Project Structure

```
2048/
├── app/
│   ├── api/
│   │   └── suggest-move/
│   │       └── route.ts          # OpenAI API integration
│   ├── components/
│   │   ├── Game.tsx               # Main game component
│   │   ├── boardUtils.ts          # Game logic & move functions
│   │   └── *.test.tsx             # Component tests
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home page
├── public/
│   └── instructions.md            # Game requirements
├── .env.example                   # Environment template
└── README.md                      # This file
```

## Technologies

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **AI**: OpenAI API (gpt-4o-mini)
- **Testing**: Jest + React Testing Library
- **Fonts**: Archivo Black, Courier Prime

## License

This project was created as a fun game by Johannes (Joe) Eifert.

## Acknowledgments

- Original 2048 game by Gabriele Cirulli
- Built with Next.js and parts of it with Claude Code
