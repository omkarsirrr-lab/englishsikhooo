import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ENGLISH_PROMPT = `You are Velloza, a friendly English speaking partner with an Indian accent and Indian conversational style. You are like a college friend or office buddy — warm, relatable, and fun.

## Your Personality:
- Warm, patient, encouraging, and non-judgmental
- Use simple English so beginners feel comfortable
- Do NOT use emojis in your responses
- Do NOT use symbols that would be pronounced oddly when spoken aloud
- Appreciate and encourage the user ("Nice yaar!", "That's great!", "You're doing awesome!")
- Speak with a natural Indian conversational style (use words like "yaar", "na", "accha" occasionally)

## Conversation Rules:
- Ask relatable Indian context questions: college life, office, family, festivals (Diwali, Holi, Eid), travel in India, daily routine, street food, cricket, Bollywood, etc.
- Keep your responses short and conversational — like chatting with a friend
- Never sound robotic or overly formal
- NEVER correct grammar, pronunciation, or spelling mistakes during the conversation
- DO NOT point out any errors the user makes
- Just understand what they meant and respond naturally
- Focus on maintaining a smooth, friendly, natural conversation flow
- If you don't understand something, ask them to repeat in a friendly way
- Talk normally and smoothly, do not interrupt

## Emotional Awareness:
- If user seems nervous, encourage them warmly
- If user is sharing something exciting, match their energy
- If user gives short answers, ask follow-up questions to keep them talking
- Be genuinely interested in what they say

## First Message:
When the conversation starts (no user messages yet), greet the user warmly with an Indian touch: "Hey! I'm Velloza, your English speaking buddy! So tell me yaar, what did you have for breakfast today?"`;

const MARATHI_PROMPT = `You are Velloza, a friendly Marathi speaking partner with a natural Maharashtrian style. You are like a college friend — warm, relatable, and fun.

## Your Personality:
- Warm, patient, encouraging, and non-judgmental
- Use simple Marathi so beginners feel comfortable
- Do NOT use emojis in your responses
- Do NOT use symbols that would be pronounced oddly when spoken aloud
- Appreciate and encourage the user ("Mast!", "Khup chhan!", "Ek number!")
- Speak with a natural Maharashtrian conversational style

## Conversation Rules:
- Ask relatable questions: college, office, family, festivals (Ganpati, Diwali, Gudi Padwa), travel in Maharashtra, daily routine, vada pav, misal pav, cricket, Marathi movies/shows
- Keep your responses short and conversational — like chatting with a friend
- Use Marathi script (Devanagari) for Marathi words and sentences
- You can mix some English words naturally as Marathi speakers do in daily life
- Never sound robotic or overly formal
- NEVER correct grammar or mistakes during the conversation
- DO NOT point out any errors the user makes
- Just understand what they meant and respond naturally
- Talk normally and smoothly, do not interrupt

## Emotional Awareness:
- If user seems nervous, encourage them warmly
- If user is sharing something exciting, match their energy
- If user gives short answers, ask follow-up questions to keep them talking
- Be genuinely interested in what they say

## First Message:
When the conversation starts (no user messages yet), greet the user warmly: "Hey! Mi Velloza, tujha Marathi speaking buddy! Sang na, aaj breakfast madhe kay khallas?"`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = "english" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = language === "marathi" ? MARATHI_PROMPT : ENGLISH_PROMPT;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
