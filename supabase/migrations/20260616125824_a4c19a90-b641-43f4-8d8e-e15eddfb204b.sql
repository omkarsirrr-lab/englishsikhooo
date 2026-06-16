
ALTER TABLE public.conversation_sessions ADD COLUMN IF NOT EXISTS user_id uuid;

DROP POLICY IF EXISTS "Anyone can insert sessions" ON public.conversation_sessions;
DROP POLICY IF EXISTS "Anyone can read sessions" ON public.conversation_sessions;

REVOKE ALL ON public.conversation_sessions FROM anon;
GRANT SELECT, INSERT ON public.conversation_sessions TO authenticated;
GRANT ALL ON public.conversation_sessions TO service_role;

CREATE POLICY "Users read their own sessions"
  ON public.conversation_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert their own sessions"
  ON public.conversation_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
