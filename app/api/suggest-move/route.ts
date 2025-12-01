import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { board, apiKey } = await request.json();

    const key = apiKey || process.env.OPENAI_API_KEY;

    if (!key) {
      return NextResponse.json(
        { error: 'No API key provided. Please provide an API key or set OPENAI_API_KEY in .env.local' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: key });

    const prompt = `You are an expert 2048 game AI. Analyze the current board state and suggest the best move.

Current board state (4x4 grid, null means empty cell):
${JSON.stringify(board, null, 2)}

Rules:
- Tiles slide in the chosen direction until blocked
- Adjacent tiles with the same value merge (2+2=4, etc.)
- Each tile can only merge once per move
- A new tile (2 or 4) appears after each move
- Goal: Reach 2048 tile while avoiding game over

Analyze the board and suggest ONE move from: left, right, up, or down.

Respond in JSON format:
{
  "move": "left|right|up|down",
  "reasoning": "Brief explanation of why this is the best move"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a 2048 game strategy expert. Always respond with valid JSON containing a move direction and reasoning.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 200,
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    const suggestion = JSON.parse(responseContent);

    // Validate the move
    const validMoves = ['left', 'right', 'up', 'down'];
    if (!validMoves.includes(suggestion.move?.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid move suggested by AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      move: suggestion.move.toLowerCase(),
      reasoning: suggestion.reasoning || 'No reasoning provided',
    });
  } catch (error: any) {
    console.error('AI suggestion error:', error);

    // Handle specific OpenAI errors
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key. Please check your OpenAI API key.' },
        { status: 401 }
      );
    }

    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a moment.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to get AI suggestion. Please try again.' },
      { status: 500 }
    );
  }
}
