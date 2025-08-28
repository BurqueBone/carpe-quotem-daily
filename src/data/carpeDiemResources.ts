import { 
  Dumbbell, Brain, Heart, Users, DollarSign, Briefcase, 
  BookOpen, Palette, MessageCircle, Sparkles, Leaf, Globe 
} from "lucide-react";

export interface Resource {
  title: string;
  description: string;
  url: string;
  type: 'article' | 'book' | 'app' | 'course' | 'video';
}

export interface Category {
  title: string;
  icon: any;
  description: string;
  resources: Resource[];
}

export const carpeDiemCategories: Category[] = [
  {
    title: "Physical",
    icon: Dumbbell,
    description: "Strengthen your body and vitality",
    resources: [
      {
        title: "7 Minute Workout",
        description: "Quick daily exercises for busy lives",
        url: "https://7minuteworkout.jnj.com/",
        type: "app"
      },
      {
        title: "Atomic Habits",
        description: "James Clear's guide to building healthy habits",
        url: "https://jamesclear.com/atomic-habits",
        type: "book"
      },
      {
        title: "Yoga with Adriene",
        description: "Free yoga practices for all levels",
        url: "https://yogawithadriene.com/",
        type: "video"
      }
    ]
  },
  {
    title: "Mental",
    icon: Brain,
    description: "Develop cognitive resilience and clarity",
    resources: [
      {
        title: "Headspace",
        description: "Meditation and mindfulness training",
        url: "https://headspace.com/",
        type: "app"
      },
      {
        title: "Thinking, Fast and Slow",
        description: "Daniel Kahneman on decision making",
        url: "https://www.amazon.com/Thinking-Fast-Slow-Daniel-Kahneman/dp/0374533555",
        type: "book"
      },
      {
        title: "The Power of Now",
        description: "Eckhart Tolle's guide to present moment awareness",
        url: "https://www.eckharttolle.com/the-power-of-now/",
        type: "book"
      }
    ]
  },
  {
    title: "Emotional",
    icon: Heart,
    description: "Navigate feelings with wisdom and grace",
    resources: [
      {
        title: "Emotional Intelligence 2.0",
        description: "Improve your EQ with practical strategies",
        url: "https://www.amazon.com/Emotional-Intelligence-2-0-Bradberry/dp/0974320625",
        type: "book"
      },
      {
        title: "Calm",
        description: "Sleep stories, meditation, and relaxation",
        url: "https://calm.com/",
        type: "app"
      },
      {
        title: "Brené Brown on Vulnerability",
        description: "TED Talk on the power of vulnerability",
        url: "https://www.ted.com/talks/brene_brown_the_power_of_vulnerability",
        type: "video"
      }
    ]
  },
  {
    title: "Family",
    icon: Users,
    description: "Deepen bonds with those you love most",
    resources: [
      {
        title: "The 5 Love Languages",
        description: "Gary Chapman's guide to expressing love",
        url: "https://www.5lovelanguages.com/",
        type: "book"
      },
      {
        title: "Family Dinner Questions",
        description: "Conversation starters for meaningful meals",
        url: "https://www.themuse.com/advice/family-dinner-conversation-starters",
        type: "article"
      },
      {
        title: "Gottman Institute",
        description: "Research-based relationship advice",
        url: "https://www.gottman.com/",
        type: "course"
      }
    ]
  },
  {
    title: "Financial",
    icon: DollarSign,
    description: "Build security and freedom through wise money choices",
    resources: [
      {
        title: "YNAB (You Need A Budget)",
        description: "Budgeting app that changes lives",
        url: "https://www.youneedabudget.com/",
        type: "app"
      },
      {
        title: "The Total Money Makeover",
        description: "Dave Ramsey's debt-free plan",
        url: "https://www.ramseysolutions.com/store/books/the-total-money-makeover",
        type: "book"
      },
      {
        title: "Khan Academy Personal Finance",
        description: "Free comprehensive financial education",
        url: "https://www.khanacademy.org/economics-finance-domain/core-finance",
        type: "course"
      }
    ]
  },
  {
    title: "Career",
    icon: Briefcase,
    description: "Find purpose and growth in your professional life",
    resources: [
      {
        title: "What Color Is Your Parachute?",
        description: "Classic career change and job hunting guide",
        url: "https://www.parachutebook.com/",
        type: "book"
      },
      {
        title: "LinkedIn Learning",
        description: "Professional development courses",
        url: "https://www.linkedin.com/learning/",
        type: "course"
      },
      {
        title: "Cal Newport's Blog",
        description: "Deep work and career capital insights",
        url: "https://calnewport.com/blog/",
        type: "article"
      }
    ]
  },
  {
    title: "Learning",
    icon: BookOpen,
    description: "Cultivate curiosity and expand your mind",
    resources: [
      {
        title: "Coursera",
        description: "University courses from top institutions",
        url: "https://www.coursera.org/",
        type: "course"
      },
      {
        title: "The Art of Learning",
        description: "Josh Waitzkin's guide to mastery",
        url: "https://www.amazon.com/Art-Learning-Journey-Optimal-Performance/dp/0743277465",
        type: "book"
      },
      {
        title: "TED-Ed",
        description: "Short, educational videos on everything",
        url: "https://ed.ted.com/",
        type: "video"
      }
    ]
  },
  {
    title: "Creative",
    icon: Palette,
    description: "Express yourself and tap into your artistic side",
    resources: [
      {
        title: "Big Magic",
        description: "Elizabeth Gilbert on creative living",
        url: "https://www.amazon.com/Big-Magic-Creative-Living-Beyond/dp/1594634718",
        type: "book"
      },
      {
        title: "Skillshare",
        description: "Online creative classes and workshops",
        url: "https://www.skillshare.com/",
        type: "course"
      },
      {
        title: "The Artist's Way",
        description: "Julia Cameron's 12-week creativity course",
        url: "https://juliacameronlive.com/the-artists-way/",
        type: "book"
      }
    ]
  },
  {
    title: "Social",
    icon: MessageCircle,
    description: "Build meaningful connections and community",
    resources: [
      {
        title: "How to Win Friends and Influence People",
        description: "Dale Carnegie's timeless social skills guide",
        url: "https://www.amazon.com/How-Win-Friends-Influence-People/dp/0937539007",
        type: "book"
      },
      {
        title: "Meetup",
        description: "Find local groups and events near you",
        url: "https://www.meetup.com/",
        type: "app"
      },
      {
        title: "The Like Switch",
        description: "FBI agent's guide to building rapport",
        url: "https://www.amazon.com/Like-Switch-Influencing-Attracting-Winning/dp/1476754489",
        type: "book"
      }
    ]
  },
  {
    title: "Spiritual",
    icon: Sparkles,
    description: "Connect with something greater than yourself",
    resources: [
      {
        title: "Daily Stoic",
        description: "Ancient wisdom for modern life",
        url: "https://dailystoic.com/",
        type: "app"
      },
      {
        title: "Man's Search for Meaning",
        description: "Viktor Frankl's powerful memoir and philosophy",
        url: "https://www.amazon.com/Mans-Search-Meaning-Viktor-Frankl/dp/0807014273",
        type: "book"
      },
      {
        title: "On Being Podcast",
        description: "Conversations about meaning and faith",
        url: "https://onbeing.org/",
        type: "video"
      }
    ]
  },
  {
    title: "Environment",
    icon: Leaf,
    description: "Create spaces that nurture and inspire you",
    resources: [
      {
        title: "The Life-Changing Magic of Tidying Up",
        description: "Marie Kondo's organization method",
        url: "https://konmari.com/",
        type: "book"
      },
      {
        title: "Forest",
        description: "Stay focused and plant real trees",
        url: "https://www.forestapp.cc/",
        type: "app"
      },
      {
        title: "Minimalism Documentary",
        description: "Explore living with less, but better",
        url: "https://minimalismfilm.com/",
        type: "video"
      }
    ]
  },
  {
    title: "Community",
    icon: Globe,
    description: "Make a positive impact in the world around you",
    resources: [
      {
        title: "VolunteerMatch",
        description: "Find volunteer opportunities in your area",
        url: "https://www.volunteermatch.org/",
        type: "app"
      },
      {
        title: "The Giver's Advantage",
        description: "Research on the benefits of giving",
        url: "https://www.amazon.com/Give-Take-Helping-Others-Success/dp/0143124986",
        type: "book"
      },
      {
        title: "Random Acts of Kindness Foundation",
        description: "Ideas for spreading kindness",
        url: "https://www.randomactsofkindness.org/",
        type: "article"
      }
    ]
  }
];