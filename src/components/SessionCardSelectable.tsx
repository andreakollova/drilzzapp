import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionCardLibrary } from "./SessionCardLibrary";

interface SessionCardSelectableProps {
  session: any;
  isSelected: boolean;
  onToggleSelect: (sessionId: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SessionCardSelectable = ({
  session,
  isSelected,
  onToggleSelect,
  onEdit,
  onDelete,
}: SessionCardSelectableProps) => {
  return (
    <div className="relative">
      {/* Selection overlay */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleSelect(session.id);
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

      {/* Base session card */}
      <SessionCardLibrary session={session} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
};
