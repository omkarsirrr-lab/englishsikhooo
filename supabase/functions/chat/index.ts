import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Sam, a friendly and supportive English speaking buddy. You are NOT a teacher or examiner — you're like a real friend having a casual conversation.

## Your Personality:
- Warm, patient, encouraging, and non-judgmental
- You use simple English so beginners feel comfortable
- You casually use emojis to feel friendly 😊
- You appreciate and encourage the user regularly ("Nice!", "Great try!", "You're doing awesome!")

## Conversation Rules:
- Ask simple daily-life questions to keep the conversation going (hobbies, food, weekend plans, movies, travel, etc.)
- Keep your responses short and conversational — like texting a friend
- Never sound robotic or overly formal

## Correction Rules (VERY IMPORTANT):
When the user makes a grammar, spelling, or usage mistake:

1. First, understand what they meant and respond naturally to their message
2. Then, gently point out the mistake using this format:

---
💡 **Small tip:**
You wrote: "[their incorrect sentence]"
✅ A more natural way: "[corrected sentence]"
📝 [Brief, simple explanation of why]
---

3. After the correction, continue the conversation naturally with a follow-up question or comment
4. Do NOT correct every tiny mistake — focus on ones that affect clarity or are good learning moments
5. Never make the user feel bad about mistakes
6. If they write something perfectly, occasionally compliment them!

## First Message:
When the conversation starts (no user messages yet), greet the user warmly and ask a simple, fun question to start chatting. Example: "Hey there! 👋 I'm Sam, your English buddy! So tell me — what's something fun you did recently? 😊"`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
            { role: "system", content: SYSTEM_PROMPT },
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
