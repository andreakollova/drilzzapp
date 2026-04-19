import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  userRating?: number | null;
}

export const StarRating = ({
  rating,
  maxRating = 5,
  size = "md",
  showValue = true,
  interactive = false,
  onRate,
  userRating,
}: StarRatingProps) => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const handleClick = (value: number) => {
    if (interactive && onRate) {
      onRate(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => {
          const starValue = i + 1;
          const displayRating = interactive && userRating !== null ? userRating : rating;
          const isFilled = starValue <= Math.round(displayRating);
          const isPartial = !isFilled && starValue - 0.5 <= displayRating;

          return (
            <button
              key={i}
              onClick={() => handleClick(starValue)}
              disabled={!interactive}
              className={cn(
                "relative transition-colors",
                interactive && "cursor-pointer hover:scale-110",
                !interactive && "cursor-default"
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors",
                  isFilled
                    ? "fill-yellow-500 text-yellow-500"
                    : isPartial
                    ? "fill-yellow-500/50 text-yellow-500"
                    : "fill-none text-muted-foreground"
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className={cn("text-muted-foreground font-medium", textSizeClasses[size])}>
          {rating > 0 ? rating.toFixed(1) : "No ratings"}
        </span>
      )}
    </div>
  );
};
