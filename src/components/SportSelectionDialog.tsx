import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SPORTS = [
  "Field Hockey",
  "Football",
  "Basketball",
  "Volleyball",
  "Floorball",
  "Tennis",
  "Ice Hockey",
  "Rugby",
  "Handball",
  "Fitness"
];

interface SportSelectionDialogProps {
  open: boolean;
  userId: string;
  onComplete: (sport: string) => void;
}

export function SportSelectionDialog({ open, userId, onComplete }: SportSelectionDialogProps) {
  const [sport, setSport] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!sport) {
      toast({
        title: "Sport required",
        description: "Please select your sport to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ sport })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Welcome to Drilzz!",
        description: `Your profile is now set up for ${sport}.`,
      });
      
      onComplete(sport);
    } catch (error) {
      console.error("Error updating sport:", error);
      toast({
        title: "Error",
        description: "Failed to save your sport. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Complete Your Profile</DialogTitle>
          <DialogDescription>
            Select your sport to personalize your Drilzz experience. This helps us show you relevant drills and connect you with coaches in your sport.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Sport *</label>
            <Select value={sport} onValueChange={setSport}>
              <SelectTrigger>
                <SelectValue placeholder="Select your sport" />
              </SelectTrigger>
              <SelectContent>
                {SPORTS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleSubmit} 
            disabled={!sport || isLoading}
            className="w-full"
          >
            {isLoading ? "Saving..." : "Continue to Drilzz"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
