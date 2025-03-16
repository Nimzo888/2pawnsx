import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ChessStatsProps {
  stats?: {
    elo: number;
    gamesPlayed: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    averageGameLength: number;
    favoriteOpening?: string;
    longestWinStreak: number;
    currentStreak: number;
    puzzlesSolved: number;
    puzzleRating: number;
  };
}

export function ChessStats({ stats }: ChessStatsProps) {
  // Default stats if none provided
  const defaultStats = {
    elo: 1200,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    winRate: 0,
    averageGameLength: 0,
    longestWinStreak: 0,
    currentStreak: 0,
    puzzlesSolved: 0,
    puzzleRating: 1200,
    favoriteOpening: "",
  };

  const s = stats || defaultStats;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Performance Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ELO Rating */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <h4 className="text-sm font-medium">ELO Rating</h4>
            <span className="text-sm font-bold">{s.elo}</span>
          </div>
          <Progress
            value={Math.min(100, (s.elo / 2000) * 100)}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {s.elo < 1200
              ? "Beginner"
              : s.elo < 1400
                ? "Casual Player"
                : s.elo < 1600
                  ? "Intermediate"
                  : s.elo < 1800
                    ? "Advanced"
                    : s.elo < 2000
                      ? "Expert"
                      : "Master"}
          </p>
        </div>

        {/* Win/Loss Ratio */}
        <div className="space-y-1.5">
          <h4 className="text-sm font-medium">Win/Loss Ratio</h4>
          <div className="flex h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="bg-green-500"
              style={{
                width: `${(s.wins / Math.max(1, s.gamesPlayed)) * 100}%`,
              }}
            ></div>
            <div
              className="bg-yellow-500"
              style={{
                width: `${(s.draws / Math.max(1, s.gamesPlayed)) * 100}%`,
              }}
            ></div>
            <div
              className="bg-red-500"
              style={{
                width: `${(s.losses / Math.max(1, s.gamesPlayed)) * 100}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Wins: {s.wins}</span>
            <span>Draws: {s.draws}</span>
            <span>Losses: {s.losses}</span>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium">Games Played</h4>
            <p className="text-2xl font-bold">{s.gamesPlayed}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Win Rate</h4>
            <p className="text-2xl font-bold">{s.winRate}%</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Longest Streak</h4>
            <p className="text-2xl font-bold">{s.longestWinStreak}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium">Current Streak</h4>
            <p className="text-2xl font-bold">{s.currentStreak}</p>
          </div>
        </div>

        {/* Puzzle Stats */}
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <h4 className="text-sm font-medium">Puzzle Rating</h4>
            <span className="text-sm font-bold">{s.puzzleRating}</span>
          </div>
          <Progress
            value={Math.min(100, (s.puzzleRating / 2000) * 100)}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {s.puzzlesSolved} puzzles solved
          </p>
        </div>

        {s.favoriteOpening && (
          <div>
            <h4 className="text-sm font-medium">Favorite Opening</h4>
            <p className="text-sm">{s.favoriteOpening}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
