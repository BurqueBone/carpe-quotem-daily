import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Zap, ArrowRight, RefreshCw, Compass, Lightbulb } from "lucide-react";
import QuoteCard from "@/components/QuoteCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useQuoteOfTheDay } from "@/hooks/useQuoteOfTheDay";
import { useAuth } from "@/components/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroSkyBackground from "@/assets/hero-sky-background.png";
const Index = () => {
  const {
    user
  } = useAuth();
  const {
    quote,
    loading: quoteLoading,
    error,
    refetch
  } = useQuoteOfTheDay();
  return <div className="min-h-screen bg-background overflow-x-hidden w-full">
      <Helmet>
        <title>Sunday4K — Your Life in Weeks. Your Weeks in Focus.</title>
        <meta name="description" content="Sunday4K helps you live intentionally with daily inspirational quotes, life balance assessments, and curated self-improvement resources across 12 life areas." />
        <meta property="og:title" content="Sunday4K — Your Life in Weeks. Your Weeks in Focus." />
        <meta property="og:description" content="Sunday4K helps you live intentionally with daily inspirational quotes, life balance assessments, and curated self-improvement resources across 12 life areas." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sunday4k.life" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url(${heroSkyBackground})`,
      backgroundPosition: 'center center'
    }}>
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 text-center max-w-4xl px-6 mx-0 py-[50px]">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            You have
            <span className="block text-primary-foreground">4,000 Sundays</span>
            in your life.
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Make them count.
          </p>
          <Link to="/life-compass-calibration" className="inline-flex items-center gap-3 mt-10 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 mx-0">
            <Compass className="w-6 h-6" />
            Calibrate Your Compass
          </Link>
        </div>
      </section>
  
      {/* Main Content Header */}
      <section className="py-[20px]">
        <div className="container mx-auto px-6 bg-transparent">
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
            <span className="block text-primary font-extrabold text-center text-5xl py-[30px]">Your life in weeks. 
Your weeks in focus.</span>
          </p>
        </div>
      </section>

      
      {/* Main Content */}
      <div className="py-0">
        <div className="container mx-auto px-[24px] py-[30px]">
          {/* Mission Statement */}
          <section className="max-w-4xl mx-auto text-center mb-20">
            <div className="rounded-3xl p-6 md:p-12 shadow-lg border border-border/10 bg-[#ffeedd]">
              <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">Sundays are a day of reflection. They represent both the end and the beginning of a week, giving you the opportunity to examine your past and prepare for your future. Use Sunday4k to assess your life's priorities, receive daily inspiration in your inbox, and utilize a curated collection of resources designed to help you transform your awareness into a life of intention.</p>
            </div>
          </section>

          {/* Quote Section */}
          <section className="max-w-4xl mx-auto mb-20">
            {quoteLoading ? <Card className="p-6 md:p-12 bg-gradient-to-br from-accent to-secondary/20 shadow-lg border border-border/10">
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <RefreshCw className="w-10 h-10 text-primary-foreground animate-spin" />
                  </div>
                  <p className="text-muted-foreground text-lg">Loading today's inspiration...</p>
                </div>
              </Card> : error ? <Card className="p-6 md:p-12 bg-white shadow-lg border border-border/10">
                <div className="text-center space-y-6">
                  <p className="text-destructive text-lg">Failed to load quote: {error}</p>
                  <Button onClick={refetch} variant="outline" size="lg">
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Try Again
                  </Button>
                </div>
              </Card> : quote ? <QuoteCard quote={quote.quote} author={quote.author} source={quote.source} displayCount={quote.display_count} lastDisplayedAt={quote.last_displayed_at} /> : null}
          </section>

          {/* Resources Section */}
          <section className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-secondary/10 to-accent/10 rounded-3xl p-6 md:p-12 border border-secondary/20">
              <div className="text-center max-w-3xl mx-auto">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-xl mb-8">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  Carpe Diem Resources
                </h2>
                
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
                  Discover a curated collection of resources across 12 life categories from Physical and Mental 
                  wellness to Career, Creative, and Spiritual growth. Each resource is carefully selected to help 
                  you seize the day and make meaningful progress in every area of your life.
                </p>
                
                <div className="bg-primary/10 rounded-2xl p-6 mb-8">
                  <p className="text-primary font-semibold text-lg mb-4">
                    ✨ Transform awareness into action ✨
                  </p>
                  <div className="flex flex-wrap justify-center gap-6 text-primary font-medium">
                    <span className="bg-white/50 px-4 py-2 rounded-full">12 Categories</span>
                    <span className="bg-white/50 px-4 py-2 rounded-full">100+ Resources</span>
                    <span className="bg-white/50 px-4 py-2 rounded-full">Lifetime Access</span>
                  </div>
                </div>
                
                <Link to="/carpe-diem" className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <Zap className="w-6 h-6" />
                  Explore Resources
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <Footer />
    </div>;
};
export default Index;