import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/layout/Navbar";
import Chessboard from "@/components/chess/Chessboard";
import GameControls from "@/components/chess/GameControls";
import MoveHistory from "@/components/chess/MoveHistory";
import LiveGame from "@/components/chess/LiveGame";
import BotGameSettings from "@/components/chess/BotGameSettings";
import GameChat from "@/components/chat/GameChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, Swords, Trophy, Cpu, X } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

const Play = () => {
  const { user, profile } = useAuth();
  const [activeGame, setActiveGame] = useState<any>(null);
  const [orientation, setOrientation] = useState<"white" | "black">("white");
  const [gameStatus, setGameStatus] = useState<
    "active" | "completed" | "waiting"
  >("waiting");
  const [gameMode, setGameMode] = useState<"human" | "bot" | null>(null);
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [recentGames, setRecentGames] = useState<any[]>([]);

  // Mock data for move history
  const [moves, setMoves] = useState([
    {
      san: "e4",
      fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      moveNumber: 1,
    },
    {
      san: "e5",
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
      moveNumber: 1,
    },
    {
      san: "Nf3",
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
      moveNumber: 2,
    },
    {
      san: "Nc6",
      fen: "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      moveNumber: 2,
    },
  ]);

  const [currentFen, setCurrentFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);

  // Time control state
  const [timeControl, setTimeControl] = useState({
    white: 600,
    black: 600,
    increment: 5,
  });

  useEffect(() => {
    // Check for active games when component mounts
    if (user) {
      checkForActiveGames();
      fetchRecentGames();
    }
  }, [user]);

  const checkForActiveGames = async () => {
    try {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .or(`white_player_id.eq.${user?.id},black_player_id.eq.${user?.id}`)
        .eq("status", "active")
        .single();

      if (error) {
        console.error("Error fetching active games:", error);
        return;
      }

      if (data) {
        setActiveGame(data);
        setGameStatus("active");
        // Set orientation based on player color
        if (data.white_player_id === user?.id) {
          setOrientation("white");
        } else {
          setOrientation("black");
        }
        // Determine if it's a bot game
        setGameMode(data.ai_level ? "bot" : "human");
      }
    } catch (error) {
      console.error("Error checking for active games:", error);
    }
  };

  const fetchRecentGames = async () => {
    try {
      const { data, error } = await supabase
        .from("games")
        .select(
          "*, white_player:profiles!white_player_id(*), black_player:profiles!black_player_id(*)",
        )
        .or(`white_player_id.eq.${user?.id},black_player_id.eq.${user?.id}`)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      if (data) {
        setRecentGames(data);
      }
    } catch (error) {
      console.error("Error fetching recent games:", error);
    }
  };

  const handleMove = (move: { from: string; to: string }) => {
    console.log("Move made:", move);
    // In a real implementation, this would send the move to the server
    // and update the game state based on the response
  };

  const handleFlipBoard = () => {
    setOrientation((prev) => (prev === "white" ? "black" : "white"));
  };

  const handleResign = () => {
    console.log("Resign game");
    // In a real implementation, this would send a resignation request to the server
  };

  const handleOfferDraw = () => {
    console.log("Offer draw");
    // In a real implementation, this would send a draw offer to the opponent
  };

  const handleMoveClick = (index: number) => {
    setCurrentMoveIndex(index);
    if (index >= 0 && index < moves.length) {
      setCurrentFen(moves[index].fen);
    } else {
      setCurrentFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    }
  };

  const createNewGame = async (
    timeControlMinutes: number,
    increment: number,
  ) => {
    try {
      setWaitingForOpponent(true);

      // Check for existing waiting games
      const { data: waitingGames, error: waitingError } = await supabase
        .from("games")
        .select("*")
        .eq("status", "waiting")
        .neq("white_player_id", user?.id)
        .is("black_player_id", null);

      if (waitingError) throw waitingError;

      // If there's a waiting game, join it
      if (waitingGames && waitingGames.length > 0) {
        const gameToJoin = waitingGames[0];

        const { error: joinError } = await supabase
          .from("games")
          .update({
            black_player_id: user?.id,
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("id", gameToJoin.id);

        if (joinError) throw joinError;

        // Set active game
        setActiveGame({
          ...gameToJoin,
          black_player_id: user?.id,
          status: "active",
        });
        setGameStatus("active");
        setOrientation("black");
        setGameMode("human");
      } else {
        // Create a new game
        const { data: newGame, error: createError } = await supabase
          .from("games")
          .insert({
            white_player_id: user?.id,
            time_control: {
              minutes: timeControlMinutes,
              increment: increment,
            },
            status: "waiting",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;

        if (newGame) {
          setActiveGame(newGame);
          setWaitingForOpponent(true);
        }
      }
    } catch (error) {
      console.error("Error creating new game:", error);
      setWaitingForOpponent(false);
    }
  };

  const startBotGame = async (settings: {
    level: number;
    timeControl: { minutes: number; increment: number };
    playAs: "white" | "black" | "random";
    enableAnalysis: boolean;
  }) => {
    try {
      // Determine player color
      const playerColor =
        settings.playAs === "random"
          ? Math.random() > 0.5
            ? "white"
            : "black"
          : settings.playAs;

      const { data: newGame, error } = await supabase
        .from("games")
        .insert({
          white_player_id: playerColor === "white" ? user?.id : null,
          black_player_id: playerColor === "black" ? user?.id : null,
          ai_level: settings.level,
          time_control: {
            minutes: settings.timeControl.minutes,
            increment: settings.timeControl.increment,
          },
          enable_analysis: settings.enableAnalysis,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      if (newGame) {
        setActiveGame(newGame);
        setGameStatus("active");
        setOrientation(playerColor);
        setGameMode("bot");
      }
    } catch (error) {
      console.error("Error starting bot game:", error);
    }
  };

  const cancelWaiting = async () => {
    if (!activeGame) return;

    try {
      const { error } = await supabase
        .from("games")
        .delete()
        .eq("id", activeGame.id);

      if (error) throw error;

      setActiveGame(null);
      setWaitingForOpponent(false);
      setGameStatus("waiting");
    } catch (error) {
      console.error("Error canceling game:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Play Chess | 2pawns</title>
      </Helmet>
      <Navbar />

      <div className="container mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold mb-6">Play Chess</h1>

        {activeGame ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center">
                    <Chessboard
                      fen={currentFen}
                      orientation={orientation}
                      onMove={handleMove}
                      size={400}
                    />
                    <GameControls
                      onFlipBoard={handleFlipBoard}
                      onResign={handleResign}
                      onOfferDraw={handleOfferDraw}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Game Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">
                    <span className="font-semibold">Status:</span> {gameStatus}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Mode:</span>{" "}
                    {gameMode === "bot" ? "vs Computer" : "vs Human"}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Time Control:</span>{" "}
                    {timeControl.white / 60} min + {timeControl.increment} sec
                  </p>
                  {waitingForOpponent && (
                    <div className="mt-4">
                      <p className="text-amber-500 mb-2">
                        Waiting for opponent to join...
                      </p>
                      <Button variant="destructive" onClick={cancelWaiting}>
                        <X className="mr-2 h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Move History</CardTitle>
                </CardHeader>
                <CardContent>
                  <MoveHistory
                    moves={moves}
                    currentMoveIndex={currentMoveIndex}
                    onMoveClick={handleMoveClick}
                  />
                </CardContent>
              </Card>

              {gameMode === "human" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Chat</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GameChat gameId={activeGame.id} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5" /> Play Online
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="quick">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="quick">Quick Match</TabsTrigger>
                    <TabsTrigger value="custom">Custom Game</TabsTrigger>
                  </TabsList>
                  <TabsContent value="quick" className="space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Find a random opponent with standard time controls
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <Button onClick={() => createNewGame(5, 0)}>
                        <Clock className="mr-2 h-4 w-4" /> 5 min
                      </Button>
                      <Button onClick={() => createNewGame(10, 0)}>
                        <Clock className="mr-2 h-4 w-4" /> 10 min
                      </Button>
                      <Button onClick={() => createNewGame(15, 10)}>
                        <Clock className="mr-2 h-4 w-4" /> 15+10
                      </Button>
                      <Button onClick={() => createNewGame(30, 0)}>
                        <Clock className="mr-2 h-4 w-4" /> 30 min
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="custom" className="pt-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Create a custom game with your preferred settings
                    </p>
                    {/* Custom game settings would go here */}
                    <Button
                      className="w-full"
                      onClick={() => createNewGame(10, 5)}
                    >
                      Create Custom Game
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cpu className="mr-2 h-5 w-5" /> Play vs Computer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BotGameSettings onStartGame={startBotGame} />
              </CardContent>
            </Card>

            {recentGames.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="mr-2 h-5 w-5" /> Recent Games
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentGames.map((game) => (
                      <div
                        key={game.id}
                        className="flex justify-between items-center p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {game.white_player?.username || "Anonymous"} vs{" "}
                            {game.black_player?.username || "Anonymous"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(game.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Analyze
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Play;
