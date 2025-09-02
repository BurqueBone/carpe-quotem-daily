import { useState } from "react";
import NavigationTabs from "@/components/NavigationTabs";
import QuoteCard from "@/components/QuoteCard";
import Header from "@/components/Header";
import { getTodayQuote } from "@/data/dailyQuotes";
const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  // Get today's inspirational quote (changes daily)
  const todayQuote = getTodayQuote();
  return <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <p className="text-lg text-muted-foreground max-w-md mx-auto">There are approximately 4,000 Sundays in a lifetime. Make them count.</p>
        </header>

        <div className="space-y-6">
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="tab-content">
            {activeTab === "home" && <div className="space-y-6">
                <QuoteCard {...todayQuote} />
                
                <div className="relative text-center space-y-6 bg-gradient-warm rounded-2xl p-8 shadow-glow border-2 border-primary/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-subtle opacity-30"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl">
                      <span className="text-2xl">⏰</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Welcome to Sunday4k</h2>
                    <p className="text-white/90 max-w-2xl mx-auto text-lg leading-relaxed mb-6">
                      Life is precious and finite. With approximately 4,000 Sundays in a lifetime, every moment counts. 
                      Sunday4k sends you uplifting daily reminders about life's meaning and mortality—not to create fear, 
                      but to inspire you to live fully and purposefully.
                    </p>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                      <p className="text-white font-medium mb-2">Ready to start your journey?</p>
                      <p className="text-white/80 text-sm">
                        Sign in to customize your notification settings and receive personalized daily reminders 
                        that will help you make each day meaningful.
                      </p>
                    </div>
                    <div className="text-white/80 font-medium">
                      ✨ Transform awareness into action ✨
                    </div>
                  </div>
                </div>
              </div>}
          </div>
        </div>
      </div>
    </div>;
};
export default Index;