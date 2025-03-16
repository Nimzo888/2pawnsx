import React, { useState, useEffect, useRef } from "react";
import Chessboard from "./Chessboard";
import GameControls from "./GameControls";
import MoveHistory from "./MoveHistory";
import GameChat from "../chat/GameChat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, BarChart, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { stockfish, StockfishInfo } from "@/lib/stockfish";

interface LiveGameProps {
  gameId: string;
  orientation?: "white" | "black";
  isPlayerTurn?: boolean;
  isVsBot?: boolean;
  enableAnalysis?: boolean;
  onGameEnd?: (result: string) => void;
}

interface Move {
  san: string;
  fen: string;
  moveNumber: number;
  timeSpent?: number;
  evaluation?: number;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isCapture?: boolean;
}

const LiveGame = ({
  gameId,
  orientation = "white",
  isPlayerTurn = true,
  isVsBot = false,
  enableAnalysis = false,
  onGameEnd,
}: LiveGameProps) => {
  const { user } = useAuth();
  const [currentFen, setCurrentFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );
  const [moves, setMoves] = useState<Move[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [gameStatus, setGameStatus] = useState<
    "active" | "completed" | "waiting" | "abandoned"
  >("active");
  const [timeControl, setTimeControl] = useState({
    white: isVsBot ? 600 : 600, // 10 minutes in seconds for live games
    black: isVsBot ? 600 : 600,
    increment: isVsBot ? 0 : 5, // No increment for bot games
  });
  const [analysisInfo, setAnalysisInfo] = useState<StockfishInfo | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameStartTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    // Initialize game state
    fetchGameState();

    // Subscribe to game state changes
    const subscription = supabase
      .channel(`game:${gameId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "game_moves",
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          const newMove = payload.new as any;
          handleNewMove({
            san: newMove.move_san,
            fen: newMove.position_fen,
            moveNumber: newMove.move_number,
            timeSpent: newMove.time_spent,
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "games",
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          const game = payload.new as any;
          if (game.status === "completed") {
            setGameStatus("completed");
            onGameEnd?.(game.result);
          }
        },
      )
      .subscribe();

    // Start game timer
    gameStartTimeRef.current = new Date();
    startGameTimer();

    return () => {
      subscription.unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
      if (enableAnalysis) stockfish.stopAnalysis();
    };
  }, [gameId]);

  // Handle Stockfish analysis for bot games
  useEffect(() => {
    if (!isVsBot || !enableAnalysis || gameStatus !== "active") return;

    const analyzePosition = () => {
      stockfish.setPosition(currentFen);
      stockfish.analyze((info) => {
        setAnalysisInfo(info);
      });
    };

    analyzePosition();

    return () => {
      stockfish.stopAnalysis();
    };
  }, [currentFen, isVsBot, enableAnalysis, gameStatus]);

  const fetchGameState = async () => {
    try {
      // Fetch game details
      const { data: gameData, error: gameError } = await supabase
        .from("games")
        .select("*")
        .eq("id", gameId)
        .single();

      if (gameError) throw gameError;

      if (gameData) {
        setGameStatus(
          gameData.status as "active" | "completed" | "waiting" | "abandoned",
        );
        // Parse time control from JSON safely
        const timeControlObj = gameData.time_control as Record<
          string,
          number
        > | null;
        setTimeControl({
          white: timeControlObj?.minutes ? timeControlObj.minutes * 60 : 600,
          black: timeControlObj?.minutes ? timeControlObj.minutes * 60 : 600,
          increment: timeControlObj?.increment ?? 5,
        });
      }

      // Fetch moves
      const { data: movesData, error: movesError } = await supabase
        .from("game_moves")
        .select("*")
        .eq("game_id", gameId)
        .order("move_number", { ascending: true });

      if (movesError) throw movesError;

      if (movesData && movesData.length > 0) {
        const formattedMoves = movesData.map((move) => ({
          san: move.move_san,
          fen: move.position_fen,
          moveNumber: move.move_number,
          timeSpent: move.time_spent,
          evaluation: move.evaluation,
        }));

        setMoves(formattedMoves);
        setCurrentMoveIndex(formattedMoves.length - 1);
        setCurrentFen(formattedMoves[formattedMoves.length - 1].fen);
      }
    } catch (error) {
      console.error("Error fetching game state:", error);
    }
  };

  const startGameTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeControl((prev) => {
        const isWhiteTurn = currentFen.includes(" w ");
        const newTime = { ...prev };

        if (gameStatus === "active") {
          if (isWhiteTurn) {
            newTime.white = Math.max(0, newTime.white - 1);
            if (newTime.white === 0) handleTimeOut("white");
          } else {
            newTime.black = Math.max(0, newTime.black - 1);
            if (newTime.black === 0) handleTimeOut("black");
          }
        }

        return newTime;
      });
    }, 1000);
  };

  const handleTimeOut = async (color: "white" | "black") => {
    // Update game status in database
    try {
      await supabase
        .from("games")
        .update({
          status: "completed",
          result: color === "white" ? "0-1" : "1-0",
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameId);

      setGameStatus("completed");
      onGameEnd?.(color === "white" ? "0-1" : "1-0");
    } catch (error) {
      console.error("Error handling timeout:", error);
    }
  };

  const handleMove = async (move: { from: string; to: string }) => {
    if (gameStatus !== "active" || !isPlayerTurn) return;

    // In a real implementation, this would validate the move with chess.js
    // and update the game state in the database
    console.log("Move made:", move);

    // Mock implementation - in a real app, this would come from the server
    const mockNewMove: Move = {
      san: `${move.from}-${move.to}`,
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2", // Example FEN
      moveNumber: moves.length + 1,
      timeSpent: 5,
    };

    // Save move to database
    try {
      const { error } = await supabase.from("game_moves").insert({
        game_id: gameId,
        move_san: mockNewMove.san,
        position_fen: mockNewMove.fen,
        move_number: mockNewMove.moveNumber,
        player_id: user?.id,
        time_spent: mockNewMove.timeSpent,
      });

      if (error) throw error;

      // Update local state
      handleNewMove(mockNewMove);

      // If playing against bot, trigger bot move
      if (isVsBot) {
        setTimeout(() => {
          makeBotMove();
        }, 1000);
      }
    } catch (error) {
      console.error("Error saving move:", error);
    }
  };

  const handleNewMove = (newMove: Move) => {
    setMoves((prev) => [...prev, newMove]);
    setCurrentMoveIndex((prev) => prev + 1);
    setCurrentFen(newMove.fen);

    // Add increment to the player who just moved
    setTimeControl((prev) => {
      const isWhiteTurn = newMove.fen.includes(" w "); // If white's turn now, black just moved
      return {
        ...prev,
        white: isWhiteTurn ? prev.white : prev.white + prev.increment,
        black: isWhiteTurn ? prev.black + prev.increment : prev.black,
      };
    });
  };

  const makeBotMove = async () => {
    // In a real implementation, this would use Stockfish to generate a move
    // For now, we'll just simulate a response
    const mockBotMove: Move = {
      san: "e7e5",
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
      moveNumber: moves.length + 1,
      timeSpent: 2,
    };

    try {
      const { error } = await supabase.from("game_moves").insert({
        game_id: gameId,
        move_san: mockBotMove.san,
        position_fen: mockBotMove.fen,
        move_number: mockBotMove.moveNumber,
        player_id: null, // Bot move
        time_spent: mockBotMove.timeSpent,
      });

      if (error) throw error;

      // Update local state
      handleNewMove(mockBotMove);
    } catch (error) {
      console.error("Error making bot move:", error);
    }
  };

  const handleResign = async () => {
    if (gameStatus !== "active") return;

    try {
      await supabase
        .from("games")
        .update({
          status: "completed",
          result: orientation === "white" ? "0-1" : "1-0", // Player resigns
          updated_at: new Date().toISOString(),
        })
        .eq("id", gameId);

      setGameStatus("completed");
      onGameEnd?.(orientation === "white" ? "0-1" : "1-0");
    } catch (error) {
      console.error("Error resigning game:", error);
    }
  };

  const handleOfferDraw = async () => {
    if (gameStatus !== "active") return;

    // In a real implementation, this would send a draw offer to the opponent
    // For now, we'll just simulate acceptance for bot games
    if (isVsBot) {
      try {
        await supabase
          .from("games")
          .update({
            status: "completed",
            result: "1/2-1/2",
            updated_at: new Date().toISOString(),
          })
          .eq("id", gameId);

        setGameStatus("completed");
        onGameEnd?.("1/2-1/2");
      } catch (error) {
        console.error("Error handling draw offer:", error);
      }
    } else {
      // Send draw offer via realtime
      console.log("Draw offered to opponent");
    }
  };

  const handleFlipBoard = () => {
    // This is just a UI change, doesn't affect the game state
  };

  const handleMoveClick = (index: number) => {
    if (index >= -1 && index < moves.length) {
      setCurrentMoveIndex(index);
      setCurrentFen(
        index === -1
          ? "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          : moves[index].fen,
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main game area - Takes up 2/3 of the space on larger screens */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge
              variant={gameStatus === "active" ? "default" : "secondary"}
              className="px-2 py-1"
            >
              {gameStatus === "active" ? "Game in progress" : "Game completed"}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Game ID: {gameId.substring(0, 8)}
            </span>
          </div>
          {enableAnalysis && isVsBot && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                Eval:{" "}
                {analysisInfo?.score
                  ? (analysisInfo.score.value / 100).toFixed(2)
                  : "0.00"}
              </Badge>
              <Badge variant="outline">Depth: {analysisInfo?.depth || 0}</Badge>
            </div>
          )}
        </div>

        <Chessboard
          fen={currentFen}
          orientation={orientation}
          onMove={handleMove}
          interactive={
            gameStatus === "active" &&
            isPlayerTurn &&
            currentMoveIndex === moves.length - 1
          }
          size={500}
        />

        <GameControls
          onResign={handleResign}
          onOfferDraw={handleOfferDraw}
          onFlipBoard={handleFlipBoard}
          timeControl={timeControl}
          isPlayerTurn={isPlayerTurn}
          playerColor={orientation}
          gameStatus={gameStatus}
          timeControlName={
            isVsBot
              ? undefined
              : `${Math.floor(timeControl.white / 60)}+${timeControl.increment}`
          }
        />
      </div>

      {/* Game Info - Takes up 1/3 of the space on larger screens */}
      <div className="lg:col-span-1">
        <Tabs defaultValue="moves">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="moves" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Moves
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>
          <TabsContent value="moves" className="mt-4">
            <MoveHistory
              moves={moves}
              currentMoveIndex={currentMoveIndex}
              onMoveClick={handleMoveClick}
            />
          </TabsContent>
          <TabsContent value="chat" className="mt-4">
            <GameChat gameId={gameId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default LiveGame;
