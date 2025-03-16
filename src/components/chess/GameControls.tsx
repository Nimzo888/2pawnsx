import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Flag,
  RotateCcw,
  FastForward,
  Pause,
  Clock,
  MessageSquare,
} from "lucide-react";

interface GameControlsProps {
  onResign?: () => void;
  onOfferDraw?: () => void;
  onFlipBoard?: () => void;
  timeControl?: {
    white: number; // time in seconds
    black: number; // time in seconds
    increment: number; // increment in seconds
  };
  isPlayerTurn?: boolean;
  playerColor?: "white" | "black";
  gameStatus?: "active" | "completed" | "waiting" | "abandoned";
  timeControlName?: string; // Display name of the time control (e.g., "3+2", "Bullet", etc.)
}

const GameControls = ({
  onResign,
  onOfferDraw,
  onFlipBoard,
  timeControl = { white: 600, black: 600, increment: 5 },
  isPlayerTurn = true,
  playerColor = "white",
  gameStatus = "active",
  timeControlName,
}: GameControlsProps) => {
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <Card className="w-full bg-white">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          {/* Time Control Display */}
          <div className="space-y-2">
            {timeControlName && (
              <div className="flex justify-center items-center text-sm font-medium text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {timeControlName}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`flex items-center p-2 rounded-md ${playerColor === "black" && isPlayerTurn ? "bg-primary/10" : "bg-gray-100"}`}
              >
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-mono font-medium">
                  {formatTime(timeControl.black)}
                </span>
              </div>
              <div
                className={`flex items-center p-2 rounded-md ${playerColor === "white" && isPlayerTurn ? "bg-primary/10" : "bg-gray-100"}`}
              >
                <Clock className="h-4 w-4 mr-2" />
                <span className="font-mono font-medium">
                  {formatTime(timeControl.white)}
                </span>
              </div>
            </div>
          </div>

          {/* Game Controls */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={onFlipBoard}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Flip
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onOfferDraw}
              disabled={gameStatus !== "active"}
              className="flex items-center gap-1"
            >
              <Pause className="h-4 w-4" />
              Draw
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onResign}
              disabled={gameStatus !== "active"}
              className="flex items-center gap-1 text-destructive hover:text-destructive"
            >
              <Flag className="h-4 w-4" />
              Resign
            </Button>
          </div>

          {/* Game Status */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div
                className={`h-2 w-2 rounded-full mr-2 ${gameStatus === "active" ? "bg-green-500" : gameStatus === "waiting" ? "bg-amber-500" : "bg-gray-400"}`}
              />
              <span className="text-sm">
                {gameStatus === "active"
                  ? "Game in progress"
                  : gameStatus === "waiting"
                    ? "Waiting for opponent"
                    : gameStatus === "abandoned"
                      ? "Game abandoned"
                      : "Game completed"}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <MessageSquare className="h-4 w-4" />
              Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameControls;
