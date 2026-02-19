
-- Create table for tracking conversation sessions and performance
CREATE TABLE public.conversation_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  duration_seconds INTEGER,
  overall_score NUMERIC(3,1),
  grammar_mistakes INTEGER DEFAULT 0,
  pronunciation_issues INTEGER DEFAULT 0,
  vocabulary_level TEXT,
  fluency_feedback TEXT,
  confidence_level TEXT,
  summary_json JSONB,
  messages_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (public access since no auth)
ALTER TABLE public.conversation_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts and reads for now (no auth)
CREATE POLICY "Anyone can insert sessions" ON public.conversation_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read sessions" ON public.conversation_sessions FOR SELECT USING (true);
