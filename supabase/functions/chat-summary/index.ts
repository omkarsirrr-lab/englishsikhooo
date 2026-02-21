import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ANALYSIS_PROMPT = `You are an expert English language coach analyzing a conversation between a learner and their speaking partner Velloza.

Analyze ONLY the user's messages for grammar, pronunciation hints (based on spelling/word usage), vocabulary, and fluency.

Return a JSON object with EXACTLY this structure (no markdown, no code blocks, just raw JSON):
{
  "overall_score": <number 1-10>,
  "grammar_mistakes": <count>,
  "pronunciation_issues": <count>,
  "vocabulary_level": "Basic" | "Intermediate" | "Advanced",
  "fluency_feedback": "<1-2 sentence assessment>",
  "confidence_level": "Low" | "Medium" | "High",
  "corrections": [
    {
      "incorrect": "<what user said>",
      "correct": "<corrected version>",
      "explanation": "<brief simple explanation>",
      "pronunciation_tip": "<syllable breakdown if relevant, else empty>"
    }
  ],
  "repeated_mistakes": ["<pattern 1>", "<pattern 2>"],
  "improvement_areas": ["<area 1>", "<area 2>", "<area 3>"],
  "daily_tips": ["<tip 1>", "<tip 2>", "<tip 3>"],
  "practice_questions": ["<q1>", "<q2>", "<q3>", "<q4>", "<q5>"],
  "pronunciation_words": ["<word1>", "<word2>", "<word3>", "<word4>", "<word5>"],
  "speaking_tasks": ["<task1>", "<task2>", "<task3>"]
}

Be encouraging and supportive in all feedback. Never be harsh. If the user made no mistakes, praise them and still provide practice material.
If there are very few user messages, still provide a score and helpful practice material.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, duration_seconds } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const conversationText = messages
      .map((m: { role: string; content: string }) =>
        `${m.role === "user" ? "User" : "Velloza"}: ${m.content}`
      )
      .join("\n");

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
            { role: "system", content: ANALYSIS_PROMPT },
            { role: "user", content: `Analyze this conversation:\n\n${conversationText}` },
          ],
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Failed to generate summary" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let summaryText = data.choices?.[0]?.message?.content || "";

    // Strip markdown code blocks if present
    summaryText = summaryText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let summary;
    try {
      summary = JSON.parse(summaryText);
    } catch {
      console.error("Failed to parse summary JSON:", summaryText);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Save to database
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from("conversation_sessions").insert({
        duration_seconds,
        overall_score: summary.overall_score,
        grammar_mistakes: summary.grammar_mistakes,
        pronunciation_issues: summary.pronunciation_issues,
        vocabulary_level: summary.vocabulary_level,
        fluency_feedback: summary.fluency_feedback,
        confidence_level: summary.confidence_level,
        summary_json: summary,
        messages_json: messages,
      });
    } catch (dbErr) {
      console.error("DB save error:", dbErr);
      // Don't fail the request if DB save fails
    }

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("summary error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
