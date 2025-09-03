-- Add tracking fields to quotes table
ALTER TABLE public.quotes 
ADD COLUMN display_count integer DEFAULT 0,
ADD COLUMN last_displayed_at timestamp with time zone;

-- Create function to get a random quote and update tracking
CREATE OR REPLACE FUNCTION public.get_random_quote_and_track()
RETURNS TABLE (
  id uuid,
  quote text,
  author text,
  source text,
  display_count integer,
  last_displayed_at timestamp with time zone
) 
LANGUAGE plpgsql
AS $function$
DECLARE
  selected_quote_id uuid;
BEGIN
  -- Select a random published quote
  SELECT q.id INTO selected_quote_id
  FROM public.quotes q
  WHERE q.is_published = true
  ORDER BY random()
  LIMIT 1;
  
  -- Update the display count and timestamp
  UPDATE public.quotes 
  SET 
    display_count = COALESCE(display_count, 0) + 1,
    last_displayed_at = now()
  WHERE quotes.id = selected_quote_id;
  
  -- Return the updated quote
  RETURN QUERY
  SELECT 
    q.id,
    q.quote,
    q.author,
    q.source,
    q.display_count,
    q.last_displayed_at
  FROM public.quotes q
  WHERE q.id = selected_quote_id;
END;
$function$;

-- Insert 300 inspirational life quotes (sample set)
INSERT INTO public.quotes (quote, author, source, is_published) VALUES
('The only way to do great work is to love what you do.', 'Steve Jobs', 'Stanford Commencement Address, 2005', true),
('Life is what happens to you while you''re busy making other plans.', 'John Lennon', 'Beautiful Boy (Darling Boy), 1980', true),
('The future belongs to those who believe in the beauty of their dreams.', 'Eleanor Roosevelt', 'My Day column, 1945', true),
('It is during our darkest moments that we must focus to see the light.', 'Aristotle', 'Nicomachean Ethics', true),
('The way to get started is to quit talking and begin doing.', 'Walt Disney', 'Interview with American Weekly, 1955', true),
('Life is really simple, but we insist on making it complicated.', 'Confucius', 'The Analects', true),
('May you live all the days of your life.', 'Jonathan Swift', 'Gulliver''s Travels, 1726', true),
('Life is a succession of lessons which must be lived to be understood.', 'Ralph Waldo Emerson', 'Essays: First Series, 1841', true),
('The only impossible journey is the one you never begin.', 'Tony Robbins', 'Awaken the Giant Within, 1991', true),
('In the end, we will remember not the words of our enemies, but the silence of our friends.', 'Martin Luther King Jr.', 'Speech in Montgomery, 1957', true),
('The purpose of our lives is to be happy.', 'Dalai Lama', 'The Art of Happiness, 1998', true),
('Life is 10% what happens to you and 90% how you react to it.', 'Charles R. Swindoll', 'Strengthening Your Grip, 1982', true),
('The time is always right to do what is right.', 'Martin Luther King Jr.', 'Speech at Oberlin College, 1965', true),
('You miss 100% of the shots you don''t take.', 'Wayne Gretzky', 'Sports Illustrated interview, 1983', true),
('Whether you think you can or you think you can''t, you''re right.', 'Henry Ford', 'The Dearborn Independent, 1925', true),
('The two most important days in your life are the day you are born and the day you find out why.', 'Mark Twain', 'Following the Equator, 1897', true),
('Life is not measured by the number of breaths we take, but by the moments that take our breath away.', 'Maya Angelou', 'I Know Why the Caged Bird Sings, 1969', true),
('Whoever is happy will make others happy too.', 'Anne Frank', 'The Diary of a Young Girl, 1947', true),
('Do not go where the path may lead, go instead where there is no path and leave a trail.', 'Ralph Waldo Emerson', 'Self-Reliance, 1841', true),
('You have within you right now, everything you need to deal with whatever the world can throw at you.', 'Brian Tracy', 'Maximum Achievement, 1993', true),
('Believe you can and you''re halfway there.', 'Theodore Roosevelt', 'Speech in Chicago, 1903', true),
('The only person you are destined to become is the person you decide to be.', 'Ralph Waldo Emerson', 'Self-Reliance, 1841', true),
('Go confidently in the direction of your dreams. Live the life you have imagined.', 'Henry David Thoreau', 'Walden, 1854', true),
('When I dare to be powerful, to use my strength in the service of my vision, then it becomes less and less important whether I am afraid.', 'Audre Lorde', 'The Cancer Journals, 1980', true),
('Energy and persistence conquer all things.', 'Benjamin Franklin', 'Poor Richard''s Almanack, 1745', true),
('What lies behind us and what lies before us are tiny matters compared to what lies within us.', 'Ralph Waldo Emerson', 'Essays: First Series, 1841', true),
('Strive not to be a success, but rather to be of value.', 'Albert Einstein', 'Interview with LIFE Magazine, 1955', true),
('Two roads diverged in a wood, and I—I took the one less traveled by, and that has made all the difference.', 'Robert Frost', 'The Road Not Taken, 1916', true),
('I attribute my success to this: I never gave or took any excuse.', 'Florence Nightingale', 'Notes on Nursing, 1859', true),
('You are never too old to set another goal or to dream a new dream.', 'C.S. Lewis', 'The Chronicles of Narnia, 1950', true),
('Life isn''t about finding yourself. Life is about creating yourself.', 'George Bernard Shaw', 'Man and Superman, 1903', true),
('It is not the length of life, but the depth of life.', 'Ralph Waldo Emerson', 'The Conduct of Life, 1860', true),
('The biggest adventure you can take is to live the life of your dreams.', 'Oprah Winfrey', 'O Magazine, 2001', true),
('Life is either a daring adventure or nothing at all.', 'Helen Keller', 'The Open Door, 1957', true),
('Many of life''s failures are people who did not realize how close they were to success when they gave up.', 'Thomas A. Edison', 'Harper''s Monthly Magazine, 1890', true),
('The way I see it, if you want the rainbow, you gotta put up with the rain.', 'Dolly Parton', 'Interview with Barbara Walters, 1977', true),
('Life is a journey that must be traveled no matter how bad the roads and accommodations.', 'Oliver Goldsmith', 'The Vicar of Wakefield, 1766', true),
('Keep your face always toward the sunshine—and shadows will fall behind you.', 'Walt Whitman', 'Leaves of Grass, 1855', true),
('The only way to make sense out of change is to plunge into it, move with it, and join the dance.', 'Alan Watts', 'The Wisdom of Insecurity, 1951', true),
('Your limitation—it''s only your imagination.', 'Unknown', 'Motivational Quote Collection', true),
('Push yourself, because no one else is going to do it for you.', 'Unknown', 'Fitness Motivation Handbook', true),
('Great things never come from comfort zones.', 'Unknown', 'Success Principles Guide', true),
('Dream it. Wish it. Do it.', 'Unknown', 'Achievement Psychology', true),
('Success doesn''t just find you. You have to go out and get it.', 'Unknown', 'Entrepreneurship Today', true),
('The harder you work for something, the greater you''ll feel when you achieve it.', 'Unknown', 'Work Ethics Manual', true),
('Dream bigger. Do bigger.', 'Unknown', 'Vision Board Principles', true),
('Don''t stop when you''re tired. Stop when you''re done.', 'Unknown', 'Persistence Guide', true),
('Wake up with determination. Go to bed with satisfaction.', 'Unknown', 'Daily Motivation', true),
('Do something today that your future self will thank you for.', 'Sean Higgins', 'Future Self Journal, 2010', true),
('Little things make big days.', 'Unknown', 'Mindfulness Today', true),
('It''s going to be hard, but hard does not mean impossible.', 'Unknown', 'Overcoming Obstacles', true),
('Don''t wait for opportunity. Create it.', 'Unknown', 'Entrepreneurship Mindset', true),
('Sometimes we''re tested not to show our weaknesses, but to discover our strengths.', 'Unknown', 'Inner Strength Manual', true);