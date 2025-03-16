import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Calendar, Trophy, X, BarChart } from "lucide-react";

interface ChessGameProps {
  game?: {
    id: string;
    opponent: string;
    opponentAvatar?: string;
    opponentRating: number;
    userColor: "white" | "black";
    result: "win" | "loss" | "draw";
    date: string;
    timeControl: string;
    moves: number;
    opening?: string;
  };
}

export function ChessGame({ game }: ChessGameProps) {
  // If no game is provided, show a placeholder
  if (!game) {
    return (
      <Card className="overflow-hidden bg-muted/30">
        <div className="h-32 bg-gradient-to-r from-muted to-muted/60"></div>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                <div className="h-3 w-24 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
            <div className="h-6 w-16 bg-muted animate-pulse rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const {
    opponent,
    opponentAvatar,
    opponentRating,
    userColor,
    result,
    date,
    timeControl,
    moves,
    opening,
  } = game;

  const resultVariant = {
    win: "success",
    loss: "destructive",
    draw: "secondary",
  }[result];

  const resultText = {
    win: "Victory",
    loss: "Defeat",
    draw: "Draw",
  }[result];

  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div
        className={`h-2 ${result === "win" ? "bg-green-500" : result === "loss" ? "bg-red-500" : "bg-yellow-500"}`}
      ></div>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={opponentAvatar} />
              <AvatarFallback>{opponent.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center">
                <p className="font-medium">{opponent}</p>
                <Badge variant="outline" className="ml-2">
                  {opponentRating}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {userColor === "white"
                  ? "You played as White"
                  : "You played as Black"}
              </p>
            </div>
          </div>
          <Badge variant={resultVariant as any}>{resultText}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            {formattedDate}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            {timeControl}
          </div>
          <div className="flex items-center text-muted-foreground">
            <X className="h-3.5 w-3.5 mr-1.5" />
            {moves} moves
          </div>
          <div className="flex items-center text-muted-foreground">
            <BarChart className="h-3.5 w-3.5 mr-1.5" />
            {opening || "Custom opening"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
