-- Allow admins to view all savings_goals for user management stats
DROP POLICY IF EXISTS "Users can view own savings goals" ON public.savings_goals;

CREATE POLICY "Users can view savings goals"
ON public.savings_goals
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin')
);

-- Allow admins to view all expenses for user management stats
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;

CREATE POLICY "Users can view expenses"
ON public.expenses
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin')
);