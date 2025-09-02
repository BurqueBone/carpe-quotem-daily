export interface Quote {
  quote: string;
  author: string;
  source?: string;
}

export const dailyQuotes: Quote[] = [
  {
    quote: "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate, to have it make some difference that you have lived and lived well.",
    author: "Ralph Waldo Emerson",
    source: "Essays and Lectures"
  },
  {
    quote: "In the end, it's not the years in your life that count. It's the life in your years.",
    author: "Abraham Lincoln",
    source: "Attributed"
  },
  {
    quote: "The meaning of life is to find your gift. The purpose of life is to give it away.",
    author: "Pablo Picasso",
    source: "Attributed"
  },
  {
    quote: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
    source: "Beautiful Boy (Darling Boy)"
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    source: "Stanford Commencement Speech, 2005"
  },
  {
    quote: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
    source: "Stanford Commencement Speech, 2005"
  },
  {
    quote: "The good life is one inspired by love and guided by knowledge.",
    author: "Bertrand Russell",
    source: "What I Believe"
  },
  {
    quote: "Life isn't about finding yourself. Life is about creating yourself.",
    author: "George Bernard Shaw",
    source: "Attributed"
  },
  {
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    source: "Attributed"
  },
  {
    quote: "Don't count the days, make the days count.",
    author: "Muhammad Ali",
    source: "Attributed"
  },
  {
    quote: "Life is 10% what happens to you and 90% how you react to it.",
    author: "Charles R. Swindoll",
    source: "Strengthening Your Grip"
  },
  {
    quote: "The present moment is the only time over which we have dominion.",
    author: "Thich Nhat Hanh",
    source: "The Miracle of Mindfulness"
  }
];

// Get a quote based on the current day to ensure it changes daily
export const getTodayQuote = (): Quote => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const quoteIndex = dayOfYear % dailyQuotes.length;
  return dailyQuotes[quoteIndex];
};