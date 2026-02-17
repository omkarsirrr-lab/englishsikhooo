

# AI English Speaking Buddy

A friendly, conversational English practice app where users chat with an AI buddy that helps improve their spoken English in a supportive, non-judgmental way.

## Page 1: Welcome / Landing Screen
- Warm, friendly welcome message introducing the AI buddy
- Brief explanation of how it works (practice English, get gentle corrections, have fun conversations)
- "Start Chatting" button to begin
- Clean, approachable design with soft colors

## Page 2: Chat Interface
- **Chat area** with message bubbles (user messages on right, AI buddy on left)
- AI buddy avatar with a friendly name (e.g., "Sam")
- Text input field with send button
- AI starts with a casual greeting and a simple question to get the conversation going

### AI Behavior (powered by Gemini):
- Talks casually like a real friend — not a teacher
- Asks daily-life questions (hobbies, food, weekend plans, etc.)
- When the user makes a grammar/spelling mistake:
  - First understands what they meant
  - Then gently explains the mistake with a clear correction
  - Shows the correct sentence highlighted
  - Gives a simple pronunciation/usage tip
  - Continues the conversation naturally after correcting
- Regularly encourages and appreciates the user for trying
- Uses simple English so beginners feel comfortable

### Chat Features:
- Scrollable message history within the session
- Visual distinction between regular chat and correction messages (corrections shown in a friendly highlight card)
- Typing indicator while AI is responding

## Design Style
- Warm, modern, and minimal — feels like a messaging app
- Soft rounded bubbles, friendly colors (light blues, greens)
- Mobile-friendly responsive layout
- Supportive emoji use by the AI buddy

## Backend
- Uses Google Gemini API (via Supabase Edge Function) for AI conversation
- System prompt carefully crafted to follow the friendly buddy persona and correction rules
- No user accounts needed — conversation lives in the current session

