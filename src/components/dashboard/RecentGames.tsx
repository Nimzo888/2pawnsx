import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Clock, Award, TrendingUp } from "lucide-react";

interface GameResult {
  id: string;
  opponent: {
    name: string;
    avatar: string;
  };
  result: "win" | "loss" | "draw";
  timeControl: string;
  date: string;
  eloChange: number;
}

interface RecentGamesProps {
  games?: GameResult[];
  maxGames?: number;
}

const RecentGames = ({
  games = [
    {
      id: "game1",
      opponent: {
        name: "Magnus C.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Magnus",
      },
      result: "win",
      timeControl: "10+5",
      date: "2 hours ago",
      eloChange: 12,
    },
    {
      id: "game2",
      opponent: {
        name: "Hikaru N.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hikaru",
      },
      result: "loss",
      timeControl: "5+3",
      date: "Yesterday",
      eloChange: -8,
    },
    {
      id: "game3",
      opponent: {
        name: "Fabiano C.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fabiano",
      },
      result: "draw",
      timeControl: "15+10",
      date: "2 days ago",
      eloChange: 0,
    },
  ],
  maxGames = 3,
}: RecentGamesProps) => {
  const displayGames = games.slice(0, maxGames);

  return (
    <Card className="w-full bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Recent Games</span>
          <Button variant="ghost" size="sm" className="text-xs">
            View All <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayGames.map((game) => (
            <div
              key={game.id}
              className="flex items-center justify-between border-b border-border pb-3 last:border-0"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={game.opponent.avatar}
                  alt={game.opponent.name}
                  className="h-8 w-8 rounded-full"
                />
                <div>
                  <p className="font-medium text-sm">{game.opponent.name}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{game.timeControl}</span>
                    <span className="mx-1">•</span>
                    <span>{game.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-3 text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getResultStyles(game.result)}`}
                  >
                    {game.result.toUpperCase()}
                  </span>
                  <div className="flex items-center justify-end mt-1 text-xs">
                    <TrendingUp
                      className={`h-3 w-3 mr-1 ${getEloChangeColor(game.eloChange)}`}
                    />
                    <span className={getEloChangeColor(game.eloChange)}>
                      {game.eloChange > 0
                        ? `+${game.eloChange}`
                        : game.eloChange}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Award className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper functions for styling
const getResultStyles = (result: string): string => {
  switch (result) {
    case "win":
      return "bg-secondary/20 text-secondary";
    case "loss":
      return "bg-destructive/20 text-destructive";
    case "draw":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getEloChangeColor = (eloChange: number): string => {
  if (eloChange > 0) return "text-secondary";
  if (eloChange < 0) return "text-destructive";
  return "text-muted-foreground";
};

export default RecentGames;
