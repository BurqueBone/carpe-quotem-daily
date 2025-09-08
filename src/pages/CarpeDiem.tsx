import { useState } from "react";
import CategoryCard from "@/components/CategoryCard";
import { useCarpeDiemData } from "@/hooks/useCarpeDiemData";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Zap, ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/components/AuthContext";

const CarpeDiem = () => {
  const { categories, loading, error } = useCarpeDiemData();
  const { user } = useAuth();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleSendNow = async () => {
    try {
      setSending(true);
      const { data, error } = await supabase.functions.invoke('send-daily-quotes');
      if (error) throw error;
      toast({
        title: "Daily quote email triggered",
        description: "Emails have been queued successfully.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to send",
        description: err?.message ?? "Unexpected error triggering send.",
      });
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl flex-1">
        <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-gradient-warm flex items-center justify-center shadow-glow mx-auto">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-warm bg-clip-text text-transparent">
          Carpe Diem
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Life is finite and precious. These resources will help you seize each day and grow across 
          every dimension of your human experience. Choose an area to focus on today.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load resources: {error}</span>
            <Button variant="outline" size="sm" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="p-6 rounded-lg border bg-card">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />  
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.title}
              icon={<category.icon className="w-5 h-5" />}
              description={category.description}
              resources={category.resources}
            />
          ))}
        </div>
      )}

      <div className="bg-gradient-subtle rounded-xl p-8 border border-border/50 shadow-card text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-primary">
            <ArrowRight className="w-5 h-5" />
            <span className="font-semibold">Start Today</span>
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            "The best time to plant a tree was 20 years ago. The second best time is now."
          </h3>
          <p className="text-muted-foreground">
            Pick one resource from any category above and take action today. 
            Small steps compound into extraordinary transformations.
          </p>
          {user && (
            <div className="pt-4">
              <Button onClick={handleSendNow} disabled={sending} className="gap-2">
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send daily quote now"}
              </Button>
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

export default CarpeDiem;