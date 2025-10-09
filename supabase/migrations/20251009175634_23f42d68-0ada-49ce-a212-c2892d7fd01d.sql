-- Add birthdate column to profiles table
ALTER TABLE public.profiles
ADD COLUMN birthdate DATE;

-- Add comment to explain the column
COMMENT ON COLUMN public.profiles.birthdate IS 'User birthdate for Sunday Counter feature';