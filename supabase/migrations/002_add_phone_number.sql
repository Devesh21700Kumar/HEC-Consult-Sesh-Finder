-- Add phone_number column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone_number text;

-- Update RLS policy to allow all logged-in users to view profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Anyone logged in can view all profiles" ON profiles
  FOR SELECT
  USING (true);

-- Add delete policy for sessions
CREATE POLICY IF NOT EXISTS "Users can delete sessions they participate in" ON sessions
  FOR DELETE USING (auth.uid() = participant1 OR auth.uid() = participant2);
