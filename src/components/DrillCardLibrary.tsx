import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Play, Clock, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";

interface DrillCardLibraryProps {
  drill: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const DrillCardLibrary = ({ drill, onEdit, onDelete }: DrillCardLibraryProps) => {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation();

  const hasVideo = drill.video_url && drill.video_url.trim() !== "";

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="relative aspect-video overflow-hidden rounded-lg cursor-pointer group">
        {/* Image/Video Thumbnail */}
        <div onClick={() => navigate(`/drill/${drill.id}`)}>
          <OptimizedImage
            src={drill.image_url}
            alt={drill.title}
            aspectRatio="video"
            className="group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity pointer-events-none" />

        {/* Three-Dot Menu - Top Left */}
        <div className="absolute top-2 left-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="h-7 w-7 p-0 shadow-lg backdrop-blur-sm bg-black/70 text-white hover:bg-black/90"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-32">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(drill.id);
                }}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(drill.id);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Category Badge - Top Right */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs shadow-lg backdrop-blur-sm bg-black/70 text-white border-0">
            {drill.category}
          </Badge>
        </div>

        {/* Video Play Icon - Center */}
        {hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 text-primary fill-primary ml-0.5" />
            </div>
          </div>
        )}

        {/* Duration Badge - Bottom Right */}
        {drill.duration && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="secondary" className="text-xs shadow-lg backdrop-blur-sm bg-black/70 text-white border-0">
              <Clock className="w-3 h-3 mr-1" />
              {drill.duration}min
            </Badge>
          </div>
        )}
      </div>

      {/* Title Below */}
      <div className="mt-2 px-1">
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {drill.title}
        </h3>
      </div>
    </div>
  );
};
