import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AddCustomActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, duration: number) => void;
}

export const AddCustomActivityDialog = ({ open, onOpenChange, onAdd }: AddCustomActivityDialogProps) => {
  const [activityName, setActivityName] = useState("");
  const [duration, setDuration] = useState("");

  const handleAdd = () => {
    if (!activityName.trim() || !duration) return;

    onAdd(activityName, parseInt(duration));
    setActivityName("");
    setDuration("");
  };

  const handleClose = () => {
    setActivityName("");
    setDuration("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Custom Activity</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="activity-name">Activity Name *</Label>
            <Input
              id="activity-name"
              placeholder="e.g., Water Break, Team Talk, Stretch"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes) *</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              placeholder="10"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleAdd} 
            disabled={!activityName.trim() || !duration}
            className=""
          >
            Add Activity
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
