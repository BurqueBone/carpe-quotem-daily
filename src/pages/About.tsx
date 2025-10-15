import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Heart, Clock, Lightbulb, Mail, BookOpen } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-warm bg-clip-text text-transparent">
              Life is Beautiful, But It's Also Brief
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              And that's exactly why we need gentle reminders to make the most of every precious moment we have.
            </p>
          </div>

          {/* The Why Section */}
          <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-warm flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-4 text-foreground">Here's What I Know About You</h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      You wake up some mornings feeling like time is slipping through your fingers. You have dreams, 
                      goals, and a deep desire to live meaningfully, but the daily grind has a way of making you forget 
                      what truly matters.
                    </p>
                    <p>
                      You've probably caught yourself scrolling endlessly, putting off that conversation with a loved one, 
                      or postponing that thing you've always wanted to try. You know life is precious, but somehow that 
                      knowledge gets buried under to-do lists and everyday worries.
                    </p>
                    <p>
                      You're not alone in this. We all need gentle, consistent reminders that our time here is both 
                      limited and incredibly valuable.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* The Solution Section */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/10 border-border/50">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-warm flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-4 text-foreground">The Gentle Wake-Up Call</h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      Sunday4K isn't about creating anxiety around mortality—it's about creating inspiration around 
                      possibility. Every carefully chosen quote serves as a loving nudge to remember what makes 
                      life extraordinary.
                    </p>
                    <p>
                      Think of it as having a wise friend who gently reminds you to call your mom, chase that dream, 
                      take that trip, or simply pause to appreciate the sunset. These aren't morbid reminders—they're 
                      invitations to live more fully.
                    </p>
                    <p>
                      When you're reminded that "this too shall pass," it doesn't just apply to hard times—it applies 
                      to beautiful moments too. Suddenly, you're more present, more grateful, more intentional.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* The Offerings Section */}
          <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-border/50">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-warm flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Daily Compass</h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      <strong className="text-foreground">Daily Inspiration:</strong> Receive thoughtfully curated quotes 
                      that remind you of life's beauty and brevity—not to create pressure, but to create presence.
                    </p>
                    <p>
                      <strong className="text-foreground">Actionable Resources:</strong> Our Carpe Diem collection offers 
                      practical ways to enhance every area of your life—from physical health to spiritual growth, from 
                      relationships to creativity.
                    </p>
                    <p>
                      <strong className="text-foreground">Gentle Consistency:</strong> No overwhelming flood of content. 
                      Just the right amount of gentle encouragement delivered when you need it most.
                    </p>
                    <p>
                      This isn't about productivity hacking or life optimization. It's about remembering that you're 
                      already enough, and your life—exactly as it is right now—is worth celebrating and nurturing.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inspiration Section */}
          <Card className="bg-gradient-to-br from-background to-primary/5 border-border/50">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-warm flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-4 text-foreground">Inspired by Research & Wisdom</h2>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      This website was inspired by the groundbreaking research and book{' '}
                      <span className="text-foreground font-semibold">
                        "You Only Die Once: How to Make It to the End with No Regrets"
                      </span>{' '}
                      written by <span className="text-foreground font-semibold">Jodi Wellman</span>.
                    </p>
                    <p>
                      Jodi's work brilliantly combines psychology, mortality awareness, and practical strategies 
                      to help us live with more vitality and purpose. Her insights remind us that acknowledging 
                      our mortality isn't morbid—it's the key to living more fully.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <a 
                        href="https://bookshop.org/a/117658/9780316574273" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" className="w-full sm:w-auto">
                          <BookOpen className="w-4 h-4 mr-2" />
                          Read the Book
                        </Button>
                      </a>
                      <a 
                        href="https://fourthousandmondays.com/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" className="w-full sm:w-auto">
                          Explore Jodi's Work
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action Section */}
          <Card className="bg-gradient-to-br from-[#FFEEDD] to-[#B8B8FF] border-[#F8F7FF]">
            <CardContent className="p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-warm flex items-center justify-center">
                  <Mail className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">Ready for Your Daily Dose of Inspiration?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
                Join thousands who start their day with a gentle reminder of life's beauty. No spam, no pressure—
                just thoughtful quotes and resources to help you live more intentionally.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="bg-gradient-warm hover:opacity-90 text-white px-8">
                    Start Your Daily Inspiration
                  </Button>
                </Link>
                <Link to="/carpe-diem">
                  <Button variant="outline" size="lg" className="px-8">
                    Explore Resources First
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Your email is safe with us. Unsubscribe anytime with one click.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;