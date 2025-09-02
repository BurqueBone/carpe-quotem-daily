import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowRight, Flower2 } from "lucide-react";
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
        

        <div className="space-y-6">
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="tab-content">
            {activeTab === "home" && <div className="space-y-6">
                <QuoteCard {...todayQuote} />
                
                <div className="relative text-center space-y-6 bg-gradient-warm rounded-2xl p-8 shadow-glow border-2 border-primary/20 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-subtle opacity-30"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl">
                      <Flower2 className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Welcome to Sunday4k</h2>
                    <p className="text-white/90 max-w-2xl mx-auto text-lg leading-relaxed mb-6">
                      Life is precious and finite. With approximately 4,000 Sundays in a lifetime, every moment counts. 
                      Sunday4k sends you uplifting daily reminders about life's meaning and mortality—not to create fear, 
                      but to inspire you to live fully and purposefully.
                    </p>
                    <Link to="/auth" className="block bg-gradient-warm rounded-xl p-4 mb-6 hover:shadow-xl shadow-glow transition-smooth cursor-pointer border border-white/30 hover:border-white/50 transform hover:scale-105">
                      
                      
                      <div className="flex items-center justify-center gap-2 text-white font-semibold">
                        <ArrowRight className="w-4 h-4" />
                        Start Your Inspiration
                      </div>
                    </Link>
                    <div className="text-white/80 font-medium">
                      ✨ Transform awareness into action ✨
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-secondary/20 to-accent/20 rounded-2xl p-6 border border-secondary/30 shadow-card hover:shadow-warm transition-smooth">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-lg">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Carpe Diem Resources</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Discover a curated collection of resources across 12 life categories—from Physical and Mental wellness 
                      to Career, Creative, and Spiritual growth. Each resource is carefully selected to help you seize the day 
                      and make meaningful progress in every area of your life.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-primary font-medium">
                      <span>12 Categories</span>
                      <span>•</span>
                      <span>100+ Resources</span>
                      <span>•</span>
                      <span>Lifetime Access</span>
                    </div>
                    <Link to="/carpe-diem" className="inline-flex items-center gap-2 bg-gradient-warm text-white px-6 py-3 rounded-lg font-medium shadow-glow hover:shadow-xl transition-smooth">
                      <Zap className="w-4 h-4" />
                      Explore Resources
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>}
          </div>
        </div>
      </div>
    </div>;
};
export default Index;