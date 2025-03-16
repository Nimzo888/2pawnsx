import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Award, Activity } from "lucide-react";

interface UserStatsProps {
  eloRating?: number;
  winRate?: number;
  totalGames?: number;
  winStreak?: number;
  ratingTrend?: "up" | "down" | "stable";
}

const UserStatsSummary = ({
  eloRating = 1250,
  winRate = 58,
  totalGames = 124,
  winStreak = 3,
  ratingTrend = "up",
}: UserStatsProps) => {
  return (
    <Card className="w-full bg-gradient-to-br from-card to-muted shadow-md border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          <span>Your Stats</span>
          {ratingTrend === "up" ? (
            <TrendingUp className="h-5 w-5 text-secondary" />
          ) : ratingTrend === "down" ? (
            <TrendingDown className="h-5 w-5 text-destructive" />
          ) : (
            <Activity className="h-5 w-5 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">ELO Rating</span>
            <div className="flex items-center">
              <Award className="h-4 w-4 text-amber-500 mr-1" />
              <span className="text-2xl font-bold">{eloRating}</span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Win Rate</span>
            <span className="text-2xl font-bold">{winRate}%</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Total Games</span>
            <span className="text-2xl font-bold">{totalGames}</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 bg-muted rounded-lg">
            <span className="text-sm text-muted-foreground">Win Streak</span>
            <div className="flex items-center">
              <span className="text-2xl font-bold">{winStreak}</span>
              {winStreak > 0 && (
                <span className="ml-1 text-xs text-secondary">🔥</span>
              )}
            </div>
          </div>
        </div>

        {/* Mini chart placeholder - would be replaced with actual chart component */}
        <div className="mt-4 h-12 w-full bg-muted rounded-md overflow-hidden relative">
          <div
            className="absolute bottom-0 left-0 h-full bg-gradient-to-r from-primary/60 to-primary/80"
            style={{ width: `${Math.min(winRate, 100)}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
            Performance Trend
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsSummary;
