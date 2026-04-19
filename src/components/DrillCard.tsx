import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { OptimizedImage } from "@/components/OptimizedImage";

interface DrillCardProps {
  drill: any;
  showAuthor?: boolean;
  showActions?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  averageRating?: number;
  ratingCount?: number;
}

export const DrillCard = ({
  drill,
  showAuthor = false,
  showActions = false,
  onEdit,
  onDelete,
  averageRating,
  ratingCount,
}: DrillCardProps) => {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group h-full flex flex-col">
      {/* Image Container - Fixed aspect ratio for consistency */}
      <div
        className="relative overflow-hidden"
        onClick={() => navigate(`/drill/${drill.id}`)}
      >
        <OptimizedImage
          src={drill.image_url}
          alt={drill.title}
          aspectRatio="video"
          className="group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Top Badges */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="text-xs shadow-lg backdrop-blur-sm bg-muted/90 border-0">
            {drill.category}
          </Badge>
        </div>

        {/* Action Buttons (Library) */}
        {showActions && (
          <div className="absolute top-3 left-3 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="shadow-soft h-9 min-w-[40px] touch-manipulation"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(drill.id);
              }}
            >
              <Pencil className="w-3.5 h-3.5 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="shadow-soft h-9 w-9 touch-manipulation p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(drill.id);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {/* Bottom Badges */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs shadow-lg backdrop-blur-sm bg-black/70 text-white border-0">
            {drill.age_group}
          </Badge>
          <Badge variant="secondary" className="text-xs shadow-lg backdrop-blur-sm bg-black/70 text-white border-0">
            {drill.difficulty}
          </Badge>
        </div>
      </div>

      {/* Content - Flexible height with consistent padding */}
      <CardContent className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col touch-manipulation">
        <div className="flex-1">
          <h3 className="font-display text-lg sm:text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {drill.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {drill.description}
          </p>
        </div>

        {/* Author Info */}
        {showAuthor && drill.profiles && (
          <div className="flex items-center gap-2 text-sm pt-3 border-t border-border">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium flex-shrink-0">
              {drill.profiles.name?.charAt(0) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{drill.profiles.name}</p>
              {drill.profiles.club && (
                <p className="text-xs text-muted-foreground truncate">
                  {drill.profiles.club}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Rating Display */}
        {typeof averageRating === "number" && typeof ratingCount === "number" && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <StarRating rating={averageRating} size="sm" showValue={false} />
            <span className="text-xs text-muted-foreground">
              {ratingCount > 0
                ? `${averageRating.toFixed(1)} (${ratingCount})`
                : "No ratings"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};
