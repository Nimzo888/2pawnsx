import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Clock, Zap } from "lucide-react";

interface ChessPuzzleProps {
  puzzle?: {
    id: string;
    rating: number;
    theme: string;
    timeSpent?: number;
    solved: boolean;
    date: string;
  };
}

export function ChessPuzzle({ puzzle }: ChessPuzzleProps) {
  // If no puzzle is provided, show a placeholder
  if (!puzzle) {
    return (
      <Card className="overflow-hidden bg-muted/30">
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <div className="h-5 w-24 bg-muted animate-pulse rounded"></div>
            <div className="h-5 w-16 bg-muted animate-pulse rounded-full"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { rating, theme, timeSpent, solved, date } = puzzle;

  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formattedTime = timeSpent
    ? `${Math.floor(timeSpent / 60)}:${(timeSpent % 60)
        .toString()
        .padStart(2, "0")}`
    : "--:--";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className={`h-2 ${solved ? "bg-green-500" : "bg-amber-500"}`}></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Brain className="h-4 w-4 mr-1.5 text-primary" />
            <CardTitle className="text-sm font-medium">{theme}</CardTitle>
          </div>
          <Badge variant={solved ? "secondary" : "outline"}>
            {solved ? "Solved" : "Attempted"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
            Rating: {rating}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Time: {formattedTime}
          </div>
          <div className="flex items-center text-muted-foreground col-span-2">
            <Zap className="h-3.5 w-3.5 mr-1.5" />
            Completed on {formattedDate}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
