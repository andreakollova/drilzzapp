import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, Search, Dumbbell, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OnboardingDialog = ({ open, onOpenChange }: OnboardingDialogProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Sparkles className="w-12 h-12 text-primary" />,
      title: "Welcome to Drilzz!",
      description: "Your all-in-one platform for creating, organizing, and sharing coaching drills. Let's take a quick tour of what you can do.",
    },
    {
      icon: <Dumbbell className="w-12 h-12 text-primary" />,
      title: "Create Your First Drill",
      description: "Design professional drill diagrams or upload photos that our AI transforms into polished graphics. Share your expertise with the community.",
    },
    {
      icon: <Search className="w-12 h-12 text-primary" />,
      title: "Explore & Discover",
      description: "Search thousands of drills by sport, category, difficulty, and age group. Find exactly what you need for your next training session.",
    },
    {
      icon: <Users className="w-12 h-12 text-primary" />,
      title: "Connect with Coaches",
      description: "Follow other coaches in your sport, comment on drills, and build your coaching network. Learn from the global community.",
    },
    {
      icon: <MessageSquare className="w-12 h-12 text-primary" />,
      title: "Organize Your Library",
      description: "Save drills to collections, build training sessions, and export PDF session plans for pitch-side reference. Everything in one place.",
    },
  ];

  const handleComplete = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);

      if (error) throw error;

      onOpenChange(false);
      toast.success("Welcome aboard! Let's start creating.");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to save progress");
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const currentStepData = steps[currentStep];

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Save completion whenever dialog closes (via built-in X, Escape, etc.)
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
        }
      });
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center text-center py-6 space-y-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            {currentStepData.icon}
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
            <p className="text-muted-foreground">{currentStepData.description}</p>
          </div>

          {/* Progress dots */}
          <div className="flex gap-2 pt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3 pt-4 w-full">
            {currentStep > 0 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
            </Button>
          </div>

          <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
            Skip tour
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingDialog;
