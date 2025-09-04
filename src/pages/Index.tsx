import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowRight, Flower2, RefreshCw } from "lucide-react";
import NavigationTabs from "@/components/NavigationTabs";
import QuoteCard from "@/components/QuoteCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useQuoteOfTheDay } from "@/hooks/useQuoteOfTheDay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const {
    quote,
    loading,
    error,
    refetch
  } = useQuoteOfTheDay();
  return <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        

        <div className="space-y-6">
          <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          <div className="tab-content">
            {activeTab === "home" && <div className="space-y-6">
                <div className="bg-gradient-warm rounded-2xl p-6 border border-primary/20 shadow-glow hover:shadow-xl transition-smooth text-center">
                  <p className="text-2xl font-bold text-white">You will die one day.</p>
                </div>
                
                <div className="p-8 bg-gradient-subtle shadow-card border-border/50 hover:shadow-warm transition-smooth">
                  <div className="absolute inset-0 bg-card/30"></div>
                  <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl">
                      <Flower2 className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-black text-center">Welcome to Sunday4k</h2>
                    <p className="text-black/90 max-w-2xl mx-auto text-lg leading-relaxed mb-6 text-center">We get it, that statement feels abrasive but we don't make it to cause distress. We use it as a form of grounding. A reminder of death instills a deep sense of gratitude and appreciation for life, prompts the setting of meaningful priorities, enhances mindfulness and intentional living, and can reduce fear and anxiety about death itself, ultimately leading to a more fulfilling existence and improved well-being. 


Sunday4k will send reminders that you will die one day, but not to drag you down, instead to inspire you to live fully and purposefully.</p>
                    <Link to="/auth" className="inline-flex items-center gap-2 bg-gradient-warm text-white px-6 py-3 rounded-lg font-medium shadow-glow hover:shadow-xl transition-smooth">
                      
                      
                      <div className="flex items-center justify-center gap-2 font-semibold text-black">
                        <ArrowRight className="w-4 h-4" />
                        Start Your Inspiration
                      </div>
                    </Link>
                  </div>
                </div>
                
                {/* Quote Section */}
                {loading ? <Card className="p-8 bg-gradient-subtle shadow-card border-border/50">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-warm flex items-center justify-center shadow-glow">
                        <RefreshCw className="w-8 h-8 text-white animate-spin" />
                      </div>
                      <p className="text-muted-foreground">Loading today's inspiration...</p>
                    </div>
                  </Card> : error ? <Card className="p-8 bg-gradient-subtle shadow-card border-border/50">
                    <div className="text-center space-y-4">
                      <p className="text-destructive">Failed to load quote: {error}</p>
                      <Button onClick={refetch} variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                    </div>
                  </Card> : quote ? <QuoteCard quote={quote.quote} author={quote.author} source={quote.source} displayCount={quote.display_count} lastDisplayedAt={quote.last_displayed_at} /> : null}
                
                <div className="bg-gradient-to-br from-secondary/20 to-accent/20 rounded-2xl p-6 border border-secondary/30 shadow-card hover:shadow-warm transition-smooth">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-lg">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Carpe Diem Resources</h3>
                    <p className="text-muted-foreground leading-relaxed">Discover a curated collection of resources across 12 life categories from Physical and Mental wellness to Career, Creative, and Spiritual growth. Each resource is carefully selected to help you seize the day and make meaningful progress in every area of your life.</p>
                    <div className="text-primary/80 font-medium mb-2">
                      ✨ Transform awareness into action ✨
                    </div>
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
      <Footer />
    </div>;
};
export default Index;