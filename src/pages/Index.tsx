import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import NavigationTabs from "@/components/NavigationTabs";
import QuoteCard from "@/components/QuoteCard";
import Header from "@/components/Header";
import Settings from "./Settings";
import CarpeDiem from "./CarpeDiem";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  // Today's inspirational quote
  const todayQuote = {
    quote: "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate, to have it make some difference that you have lived and lived well.",
    author: "Ralph Waldo Emerson",
    source: "Essays and Lectures"
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-8">
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Gentle reminders about life's preciousness, inspiring you to live each day with purpose
          </p>
        </header>

        <div className="space-y-6">
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="tab-content">
            {activeTab === "home" && (
              <div className="space-y-6">
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
              </div>
            )}
            
            {activeTab === "carpe-diem" && <CarpeDiem />}
            {activeTab === "settings" && <Settings />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
