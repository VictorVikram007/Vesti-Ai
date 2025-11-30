import { Star } from "lucide-react";

interface RatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  showValue?: boolean;
  totalRatings?: number;
}

export const Rating = ({ 
  rating, 
  onRate, 
  size = "md", 
  readonly = false, 
  showValue = false,
  totalRatings 
}: RatingProps) => {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  const starSize = sizeClasses[size];

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} transition-colors ${
              readonly ? "" : "cursor-pointer hover:text-yellow-400"
            } ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
            onClick={() => !readonly && onRate && onRate(star)}
          />
        ))}
      </div>
      {showValue && (
        <div className="flex items-center gap-1 text-sm">
          <span className="font-medium">{rating.toFixed(1)}</span>
          {totalRatings && (
            <span className="text-muted-foreground">({totalRatings})</span>
          )}
        </div>
      )}
    </div>
  );
};