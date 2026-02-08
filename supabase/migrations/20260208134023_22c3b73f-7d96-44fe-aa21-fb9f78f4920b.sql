-- Update feedback policy to allow admins to view all feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;

CREATE POLICY "Users can view feedback"
ON public.feedback
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin')
);