import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Play, Clock } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";

interface DrillCardProfileProps {
  drill: any;
}

export const DrillCardProfile = ({ drill }: DrillCardProfileProps) => {
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
      <div
        onClick={() => navigate(`/drill/${drill.id}`)}
        className="relative aspect-video overflow-hidden rounded-lg cursor-pointer group"
      >
        {/* Image/Video Thumbnail */}
        <OptimizedImage
          src={drill.image_url}
          alt={drill.title}
          aspectRatio="video"
          className="group-hover:scale-110 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Category Badge - Top Right */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs shadow-lg backdrop-blur-sm bg-black/70 text-white border-0">
            {drill.category}
          </Badge>
        </div>

        {/* Video Play Icon - Center */}
        {hasVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
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

export const DrillCardProfileSkeleton = () => {
  return (
    <div>
      <div className="aspect-video bg-muted rounded-lg animate-pulse" />
      <div className="mt-2 px-1 space-y-1">
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
};
