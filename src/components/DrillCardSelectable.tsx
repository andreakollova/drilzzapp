import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DrillCardLibrary } from "./DrillCardLibrary";

interface DrillCardSelectableProps {
  drill: any;
  isSelected: boolean;
  onToggleSelect: (drillId: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DrillCardSelectable = ({
  drill,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}: DrillCardSelectableProps) => {
  return (
    <div className="relative">
      {/* Selection overlay */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleSelect(drill.id);
        }}
        className={cn(
          "absolute inset-0 z-10 rounded-lg cursor-pointer transition-all",
          isSelected && "bg-primary/5 ring-1 ring-primary"
        )}
      >
        {/* Checkbox */}
        <div
          className={cn(
            "absolute top-1.5 left-1.5 w-5 h-5 rounded border flex items-center justify-center transition-all shadow-sm",
            isSelected
              ? "bg-primary border-primary"
              : "bg-background/90 border-border backdrop-blur-sm"
          )}
        >
          {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
      </div>

      {/* Base drill card */}
      <DrillCardLibrary drill={drill} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};
