import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Search, Clock } from "lucide-react";

interface DrillPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDrill: (drill: any) => void;
  userId?: string;
  sport?: string;
}

export const DrillPickerDialog = ({ open, onOpenChange, onSelectDrill, userId, sport }: DrillPickerDialogProps) => {
  const [drills, setDrills] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadDrills();
    }
  }, [open, userId, sport]);

  const loadDrills = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("drills")
        .select("*")
        .eq("user_id", userId)
        .eq("sport", sport)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDrills(data || []);
    } catch (error) {
      console.error("Error loading drills:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrills = drills.filter(drill => 
    drill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    drill.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add Drill to Session</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search drills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading drills...</div>
          ) : filteredDrills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? "No drills found matching your search" : "No drills available"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDrills.map((drill) => (
                <div
                  key={drill.id}
                  onClick={() => onSelectDrill(drill)}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-2">{drill.title}</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {drill.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {drill.difficulty}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {drill.age_group}
                        </span>
                      </div>
                    </div>
                    {drill.duration && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                        <Clock className="w-4 h-4" />
                        <span>{drill.duration} min</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
