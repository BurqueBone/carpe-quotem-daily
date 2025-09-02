-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  icon_name TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resources table
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('article', 'book', 'app', 'course', 'video')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since these are reference data)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Resources are viewable by everyone" 
ON public.resources 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
  BEFORE UPDATE ON public.resources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the categories data
INSERT INTO public.categories (title, icon_name, description) VALUES
  ('Physical', 'Dumbbell', 'Strengthen your body and vitality'),
  ('Mental', 'Brain', 'Develop cognitive resilience and clarity'),
  ('Emotional', 'Heart', 'Navigate feelings with wisdom and grace'),
  ('Family', 'Users', 'Deepen bonds with those you love most'),
  ('Financial', 'DollarSign', 'Build security and freedom through wise money choices'),
  ('Career', 'Briefcase', 'Find purpose and growth in your professional life'),
  ('Learning', 'BookOpen', 'Cultivate curiosity and expand your mind'),
  ('Creative', 'Palette', 'Express yourself and tap into your artistic side'),
  ('Social', 'MessageCircle', 'Build meaningful connections and community'),
  ('Spiritual', 'Sparkles', 'Connect with something greater than yourself'),
  ('Environment', 'Leaf', 'Create spaces that nurture and inspire you'),
  ('Community', 'Globe', 'Make a positive impact in the world around you');

-- Insert the resources data
WITH category_lookup AS (
  SELECT id, title FROM public.categories
)
INSERT INTO public.resources (category_id, title, description, url, type) VALUES
  -- Physical resources
  ((SELECT id FROM category_lookup WHERE title = 'Physical'), '7 Minute Workout', 'Quick daily exercises for busy lives', 'https://7minuteworkout.jnj.com/', 'app'),
  ((SELECT id FROM category_lookup WHERE title = 'Physical'), 'Atomic Habits', 'James Clear''s guide to building healthy habits', 'https://jamesclear.com/atomic-habits', 'book'),
  ((SELECT id FROM category_lookup WHERE title = 'Physical'), 'Yoga with Adriene', 'Free yoga practices for all levels', 'https://yogawithadriene.com/', 'video'),
  
  -- Mental resources
  ((SELECT id FROM category_lookup WHERE title = 'Mental'), 'Headspace', 'Meditation and mindfulness training', 'https://headspace.com/', 'app'),
  ((SELECT id FROM category_lookup WHERE title = 'Mental'), 'Thinking, Fast and Slow', 'Daniel Kahneman on decision making', 'https://www.amazon.com/Thinking-Fast-Slow-Daniel-Kahneman/dp/0374533555', 'book'),
  ((SELECT id FROM category_lookup WHERE title = 'Mental'), 'The Power of Now', 'Eckhart Tolle''s guide to present moment awareness', 'https://www.eckharttolle.com/the-power-of-now/', 'book'),
  
  -- Emotional resources
  ((SELECT id FROM category_lookup WHERE title = 'Emotional'), 'Emotional Intelligence 2.0', 'Improve your EQ with practical strategies', 'https://www.amazon.com/Emotional-Intelligence-2-0-Bradberry/dp/0974320625', 'book'),
  ((SELECT id FROM category_lookup WHERE title = 'Emotional'), 'Calm', 'Sleep stories, meditation, and relaxation', 'https://calm.com/', 'app'),
  ((SELECT id FROM category_lookup WHERE title = 'Emotional'), 'Brené Brown on Vulnerability', 'TED Talk on the power of vulnerability', 'https://www.ted.com/talks/brene_brown_the_power_of_vulnerability', 'video'),
  
  -- Family resources
  ((SELECT id FROM category_lookup WHERE title = 'Family'), 'The 5 Love Languages', 'Gary Chapman''s guide to expressing love', 'https://www.5lovelanguages.com/', 'book'),
  ((SELECT id FROM category_lookup WHERE title = 'Family'), 'Family Dinner Questions', 'Conversation starters for meaningful meals', 'https://www.themuse.com/advice/family-dinner-conversation-starters', 'article'),
  ((SELECT id FROM category_lookup WHERE title = 'Family'), 'Gottman Institute', 'Research-based relationship advice', 'https://www.gottman.com/', 'course'),
  
  -- Financial resources
  ((SELECT id FROM category_lookup WHERE title = 'Financial'), 'YNAB (You Need A Budget)', 'Budgeting app that changes lives', 'https://www.youneedabudget.com/', 'app'),
  ((SELECT id FROM category_lookup WHERE title = 'Financial'), 'The Total Money Makeover', 'Dave Ramsey''s debt-free plan', 'https://www.ramseysolutions.com/store/books/the-total-money-makeover', 'book'),
  ((SELECT id FROM category_lookup WHERE title = 'Financial'), 'Khan Academy Personal Finance', 'Free comprehensive financial education', 'https://www.khanacademy.org/economics-finance-domain/core-finance', 'course'),
  
  -- Career resources
  ((SELECT id FROM category_lookup WHERE title = 'Career'), 'What Color Is Your Parachute?', 'Classic career change and job hunting guide', 'https://www.parachutebook.com/', 'book'),
  ((SELECT id FROM category_lookup WHERE title = 'Career'), 'LinkedIn Learning', 'Professional development courses', 'https://www.linkedin.com/learning/', 'course'),
  ((SELECT id FROM category_lookup WHERE title = 'Career'), 'Cal Newport''s Blog', 'Deep work and career capital insights', 'https://calnewport.com/blog/', 'article'),
  
  -- Learning resources
  ((SELECT id FROM category_lookup WHERE title = 'Learning'), 'Coursera', 'University courses from top institutions', 'https://www.coursera.org/', 'course'),
  ((SELECT id FROM category_lookup WHERE title = 'Learning'), 'The Art of Learning', 'Josh Waitzkin''s guide to mastery', 'https://www.amazon.com/Art-Learning-Journey-Optimal-Performance/dp/0743277465', 'book'),
  ((SELECT id FROM category_lookup WHERE title = 'Learning'), 'TED-Ed', 'Short, educational videos on everything', 'https://ed.ted.com/', 'video'),
  
  -- Creative resources
  ((SELECT id FROM category_lookup WHERE title = 'Creative'), 'Big Magic', 'Elizabeth Gilbert on creative living', 'https://www.amazon.com/Big-Magic-Creative-Living-Beyond/dp/1594634718', 'book'),
  ((SELECT id FROM category_lookup WHERE title = 'Creative'), 'Skillshare', 'Online creative classes and workshops', 'https://www.skillshare.com/', 'course'),
  ((SELECT id FROM category_lookup WHERE title = 'Creative'), 'The Artist''s Way', 'Julia Cameron''s 12-week creativity course', 'https://juliacameronlive.com/the-artists-way/', 'book'),
  
  -- Social resources
  ((SELECT id FROM category_lookup WHERE title = 'Social'), 'How to Win Friends and Influence People', 'Dale Carnegie''s timeless social skills guide', 'https://www.amazon.com/How-Win-Friends-Influence-People/dp/0937539007', 'book'),
  ((SELECT id FROM category_lookup WHERE title = 'Social'), 'Meetup', 'Find local groups and events near you', 'https://www.meetup.com/', 'app'),
  ((SELECT id FROM category_lookup WHERE title = 'Social'), 'The Like Switch', 'FBI agent''s guide to building rapport', 'https://www.amazon.com/Like-Switch-Influencing-Attracting-Winning/dp/1476754489', 'book'),
  
  -- Spiritual resources
  ((SELECT id FROM category_lookup WHERE title = 'Spiritual'), 'Daily Stoic', 'Ancient wisdom for modern life', 'https://dailystoic.com/', 'app'),
  ((SELECT id FROM category_lookup WHERE title = 'Spiritual'), 'Man''s Search for Meaning', 'Viktor Frankl''s powerful memoir and philosophy', 'https://www.amazon.com/Mans-Search-Meaning-Viktor-Frankl/dp/0807014273', 'book'),
  ((SELECT id FROM category_lookup WHERE title = 'Spiritual'), 'On Being Podcast', 'Conversations about meaning and faith', 'https://onbeing.org/', 'video'),
  
  -- Environment resources
  ((SELECT id FROM category_lookup WHERE title = 'Environment'), 'The Life-Changing Magic of Tidying Up', 'Marie Kondo''s organization method', 'https://konmari.com/', 'book'),
  ((SELECT id FROM category_lookup WHERE title = 'Environment'), 'Forest', 'Stay focused and plant real trees', 'https://www.forestapp.cc/', 'app'),
  ((SELECT id FROM category_lookup WHERE title = 'Environment'), 'Minimalism Documentary', 'Explore living with less, but better', 'https://minimalismfilm.com/', 'video'),
  
  -- Community resources
  ((SELECT id FROM category_lookup WHERE title = 'Community'), 'VolunteerMatch', 'Find volunteer opportunities in your area', 'https://www.volunteermatch.org/', 'app'),
  ((SELECT id FROM category_lookup WHERE title = 'Community'), 'The Giver''s Advantage', 'Research on the benefits of giving', 'https://www.amazon.com/Give-Take-Helping-Others-Success/dp/0143124986', 'book'),
  ((SELECT id FROM category_lookup WHERE title = 'Community'), 'Random Acts of Kindness Foundation', 'Ideas for spreading kindness', 'https://www.randomactsofkindness.org/', 'article');