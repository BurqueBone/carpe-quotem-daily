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
                
                <div className="text-center space-y-4 bg-background/50 rounded-xl p-6 border border-border/30">
                  <h2 className="text-2xl font-semibold text-foreground">Remember</h2>
                  <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    Each day is a gift. You have approximately 4,000 weeks in a lifetime. 
                    Today is one of them. Make it count.
                  </p>
                  <div className="text-sm text-primary font-medium">
                    ✨ This moment will never come again ✨
                  </div>
                </div>
              </div>}
          </div>
        </div>
      </div>
    </div>;
};
export default Index;