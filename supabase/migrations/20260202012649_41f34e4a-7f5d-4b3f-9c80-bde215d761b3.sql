-- Add INSERT policy for profiles table so users can create their own profile during registration
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);