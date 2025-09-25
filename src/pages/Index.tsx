import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowRight, Flower2, RefreshCw, User, LogIn, Compass } from "lucide-react";
import NavigationTabs from "@/components/NavigationTabs";
import QuoteCard from "@/components/QuoteCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useQuoteOfTheDay } from "@/hooks/useQuoteOfTheDay";
import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");
  const { user, loading } = useAuth();
  const {
    quote,
    loading: quoteLoading,
    error,
    refetch
  } = useQuoteOfTheDay();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="tab-content">
              {activeTab === "home" && (
                <div className="space-y-6">
                  <div className="bg-gradient-warm rounded-2xl p-6 border border-primary/20 shadow-glow hover:shadow-xl transition-smooth text-center">
                    <p className="text-2xl font-bold text-white">You only have around 4,000 Sundays in your life.</p>
                  </div>
                  
                  <div className="p-8 rounded-2xl items-center bg-gradient-subtle shadow-card border-border/50 hover:shadow-warm transition-smooth">
                    <div>
                      <p className="text-black/90 max-w-2xl mx-auto text-lg leading-relaxed mb-6 text-center">Every one of them is a chance to live with purpose, create meaningful memories, and make lasting progress. But in the rush of daily life, it's easy to lose sight of what truly matters. At Sunday4K, we believe that awareness is the first step toward action. We'll deliver daily inspiration to your inbox, along with a curated collection of resources designed to help you transform your awareness into a life of intention. Stop waiting for the right moment. Start living a life with no regrets.</p>
                    </div>
                    <a href="/life-compass" className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium shadow-glow hover:shadow-xl transition-smooth">
                     <div className="flex items-center justify-center gap-2 font-semibold text-white">
                     <Compass className="w-4 h-4" />
                       Calibrate Your Compass
                     </div>
                    </a>
                  </div>
                  
                  {/* Quote Section */}
                  {quoteLoading ? (
                    <Card className="p-8 bg-gradient-to-br from-#FFEEDD to-#B8B8FF shadow-card border-border/50">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-warm flex items-center justify-center shadow-glow">
                          <RefreshCw className="w-8 h-8 text-white animate-spin" />
                        </div>
                        <p className="text-muted-foreground">Loading today's inspiration...</p>
                      </div>
                    </Card>
                  ) : error ? (
                    <Card className="p-8 bg-gradient-subtle shadow-card border-border/50">
                      <div className="text-center space-y-4">
                        <p className="text-destructive">Failed to load quote: {error}</p>
                        <Button onClick={refetch} variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                      </div>
                    </Card>
                  ) : quote ? (
                    <QuoteCard 
                      quote={quote.quote} 
                      author={quote.author} 
                      source={quote.source} 
                      displayCount={quote.display_count} 
                      lastDisplayedAt={quote.last_displayed_at} 
                    />
                  ) : null}
                  
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
                      <Link to="/carpe-diem" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium shadow-glow hover:shadow-xl transition-smooth">
                        <Zap className="w-4 h-4" />
                        Explore Resources
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;