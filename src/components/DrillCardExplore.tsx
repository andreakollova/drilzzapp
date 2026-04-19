import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { OptimizedImage } from "@/components/OptimizedImage";

interface DrillCardExploreProps {
  drill: any;
}

export const DrillCardExplore = ({ drill }: DrillCardExploreProps) => {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div
        onClick={() => navigate(`/drill/${drill.id}`)}
        className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
      >
        {/* Image */}
        <OptimizedImage
          src={drill.image_url}
          alt={drill.title}
          aspectRatio="square"
          className="rounded-lg group-hover:scale-110 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity rounded-lg" />

        {/* Category Badge - Top Right */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs shadow-lg backdrop-blur-sm bg-black/70 text-white border-0">
            {drill.category}
          </Badge>
        </div>

        {/* Title Overlay - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="font-display text-sm font-semibold text-white line-clamp-2 drop-shadow-lg">
            {drill.title}
          </h3>
          {drill.profiles && (
            <p className="text-xs text-white/80 mt-1 truncate drop-shadow">
              {drill.profiles.name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const DrillCardExploreSkeleton = () => {
  return (
    <div className="aspect-square bg-muted rounded-lg animate-pulse" />
  );
};
