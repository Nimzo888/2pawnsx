import React from "react";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface RatingBadgeProps {
  rating: number;
  isProvisional?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function RatingBadge({
  rating,
  isProvisional = false,
  showTooltip = true,
  className = "",
}: RatingBadgeProps) {
  // Get color based on rating
  const getColorClass = () => {
    if (rating < 1200) return "bg-gray-500 hover:bg-gray-600";
    if (rating < 1400) return "bg-green-500 hover:bg-green-600";
    if (rating < 1600) return "bg-blue-500 hover:bg-blue-600";
    if (rating < 1800) return "bg-purple-500 hover:bg-purple-600";
    if (rating < 2000) return "bg-yellow-500 hover:bg-yellow-600";
    if (rating < 2200) return "bg-orange-500 hover:bg-orange-600";
    return "bg-red-500 hover:bg-red-600";
  };

  // Get rating category
  const getRatingCategory = () => {
    if (rating < 1200) return "Beginner";
    if (rating < 1400) return "Novice";
    if (rating < 1600) return "Intermediate";
    if (rating < 1800) return "Advanced";
    if (rating < 2000) return "Expert";
    if (rating < 2200) return "Master";
    if (rating < 2400) return "International Master";
    return "Grandmaster";
  };

  const badge = (
    <Badge className={`${getColorClass()} ${className}`}>
      {rating}
      {isProvisional && "?"}
    </Badge>
  );

  if (!showTooltip) {
    return badge;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent>
          <p>
            {getRatingCategory()}
            {isProvisional ? " (Provisional)" : ""}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
