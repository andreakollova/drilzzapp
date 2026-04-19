import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MoreVertical, Layers } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface SessionCardLibraryProps {
  session: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SessionCardLibrary = ({ session, onEdit, onDelete }: SessionCardLibraryProps) => {
  const navigate = useNavigate();
  
  const drillCount = session.session_drills?.[0]?.count || 0;

  return (
    <Card 
      className="group overflow-hidden cursor-pointer hover:shadow-medium transition-all relative"
      onClick={() => navigate(`/sessions/${session.id}`)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Badge variant="secondary" className="text-xs">
            {session.sport}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onEdit(session.id);
              }}>
                Edit Session
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session.id);
                }}
                className="text-destructive"
              >
                Delete Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="font-display text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {session.name}
        </h3>
        
        {session.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {session.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Layers className="w-4 h-4" />
            <span>{drillCount} drills</span>
          </div>
          {session.total_duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{session.total_duration} min</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
