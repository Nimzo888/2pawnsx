import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Navbar from "@/components/layout/Navbar";
import AnalysisBoard from "@/components/chess/AnalysisBoard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  FileUp,
  Clock,
  Search,
  BarChart3,
  History,
  Share2,
  Cpu,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { stockfish } from "@/lib/stockfish";
import { analysisService } from "@/lib/analysisService";

interface GameData {
  id: string;
  date: string;
  opponent: string;
  result: string;
  pgn: string;
  moves: Array<{
    san: string;
    fen: string;
    moveNumber: number;
    evaluation?: number;
    bestMove?: string;
    pv?: string[];
  }>;
}

const Analysis = () => {
  const { user, profile } = useAuth();
  const [selectedGame, setSelectedGame] = useState<GameData | null>(null);
  const [recentGames, setRecentGames] = useState<GameData[]>([]);
  const [pgnInput, setPgnInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Fetch recent games when component mounts
  useEffect(() => {
    if (user) {
      fetchRecentGames();
    }
  }, [user]);

  const fetchRecentGames = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("games")
        .select(
          "id, created_at, result, pgn, white_player_id, black_player_id, white_player:profiles!white_player_id(id, username, avatar_url), black_player:profiles!black_player_id(id, username, avatar_url), moves(id, move_number, san_notation, fen_position, evaluation, best_move, principal_variation)",
        )
        .or(`white_player_id.eq.${user?.id},black_player_id.eq.${user?.id}`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        const formattedGames: GameData[] = data.map((game) => {
          const isWhite = game.white_player_id === user?.id;
          let opponent = "Unknown";

          if (isWhite) {
            if (game.black_player) {
              // Safely access the username property regardless of structure
              const blackPlayer = game.black_player;
              if (typeof blackPlayer === "object" && blackPlayer !== null) {
                // Handle both object and array cases
                if ("username" in blackPlayer) {
                  opponent =
                    (blackPlayer as { username?: string }).username ||
                    "Unknown";
                } else if (
                  Array.isArray(blackPlayer) &&
                  blackPlayer.length > 0 &&
                  blackPlayer[0] &&
                  typeof blackPlayer[0] === "object"
                ) {
                  opponent = blackPlayer[0].username || "Unknown";
                }
              }
            }
          } else {
            if (game.white_player) {
              // Safely access the username property regardless of structure
              const whitePlayer = game.white_player;
              if (typeof whitePlayer === "object" && whitePlayer !== null) {
                // Handle both object and array cases
                if ("username" in whitePlayer) {
                  opponent =
                    (whitePlayer as { username?: string }).username ||
                    "Unknown";
                } else if (
                  Array.isArray(whitePlayer) &&
                  whitePlayer.length > 0 &&
                  whitePlayer[0] &&
                  typeof whitePlayer[0] === "object"
                ) {
                  opponent = whitePlayer[0].username || "Unknown";
                }
              }
            }
          }
          const result = getResultText(game.result, isWhite);

          // Format moves
          const moves = game.moves.map((move) => ({
            san: move.san_notation,
            fen: move.fen_position,
            moveNumber: move.move_number,
            evaluation: move.evaluation,
            bestMove: move.best_move,
            pv: move.principal_variation
              ? move.principal_variation.split(" ")
              : undefined,
          }));

          return {
            id: game.id,
            date: new Date(game.created_at).toLocaleDateString(),
            opponent,
            result,
            pgn: game.pgn || "",
            moves,
          };
        });

        setRecentGames(formattedGames);
        if (formattedGames.length > 0 && !selectedGame) {
          setSelectedGame(formattedGames[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching recent games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getResultText = (result: string | null, isWhite: boolean) => {
    if (!result) return "Ongoing";

    if (result === "1-0") return isWhite ? "Win" : "Loss";
    if (result === "0-1") return isWhite ? "Loss" : "Win";
    return "Draw";
  };

  const handleGameSelect = (game: GameData) => {
    setSelectedGame(game);
  };

  const handlePgnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pgnInput.trim()) return;

    try {
      // Parse PGN to get moves and positions
      // This is a simplified version - in a real app you'd use a chess library to parse PGN
      const moves: Array<{
        san: string;
        fen: string;
        moveNumber: number;
      }> = [];

      // For demo purposes, we'll create a custom game with the PGN
      const newGame: GameData = {
        id: `custom-${Date.now()}`,
        date: new Date().toLocaleDateString(),
        opponent: "Custom Analysis",
        result: "Analysis",
        pgn: pgnInput,
        moves: moves,
      };

      setSelectedGame(newGame);

      // If user is logged in, save this analysis to their account
      if (user) {
        const { data, error } = await supabase.from("imported_pgn").insert({
          user_id: user.id,
          pgn: pgnInput,
          created_at: new Date().toISOString(),
          name: "Custom Analysis",
        });

        if (error) throw error;
      }
    } catch (error) {
      console.error("Error processing PGN:", error);
    }
  };

  const handleAnalysisComplete = (updatedMoves: any[]) => {
    if (selectedGame) {
      setSelectedGame({
        ...selectedGame,
        moves: updatedMoves,
      });
      setIsAnalyzing(false);
      setAnalysisProgress(100);
    }
  };

  const startFullGameAnalysis = () => {
    if (!selectedGame || !selectedGame.id) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Set up progress tracking
    const totalMoves = selectedGame.moves.length;
    let completedMoves = 0;

    const progressCallback = () => {
      completedMoves++;
      const progress = Math.round((completedMoves / totalMoves) * 100);
      setAnalysisProgress(progress);
    };

    // Convert moves to the format expected by analysisService
    const movesToAnalyze = selectedGame.moves.map((move) => ({
      moveNumber: move.moveNumber,
      fen: move.fen,
      san: move.san,
      evaluation: move.evaluation,
      bestMove: move.bestMove,
      pv: move.pv,
    }));

    // Start the analysis
    analysisService.startGameAnalysis(selectedGame.id, movesToAnalyze);
  };

  const handleShareAnalysis = async () => {
    if (!selectedGame) return;

    try {
      // In a real app, you'd generate a shareable link
      const shareableLink = `${window.location.origin}/analysis/${selectedGame.id}`;

      // Copy to clipboard
      await navigator.clipboard.writeText(shareableLink);

      // Show success message (in a real app, use a toast notification)
      alert("Analysis link copied to clipboard!");
    } catch (err) {
      console.error("Error sharing analysis:", err);
    }
  };

  const getResultClass = (result: string) => {
    if (result.includes("Win")) return "text-green-600";
    if (result.includes("Loss")) return "text-red-600";
    if (result.includes("Draw")) return "text-amber-600";
    return "text-blue-600";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Helmet>
        <title>Game Analysis | 2pawns</title>
      </Helmet>

      <Navbar
        username={profile?.username}
        avatarUrl={profile?.avatar_url}
        isPremium={profile?.is_premium}
      />

      <main className="pt-20 pb-10 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Game Analysis</h1>

        <Tabs defaultValue="recent" className="mb-6">
          <TabsList className="grid grid-cols-3 mb-4 w-full max-w-md">
            <TabsTrigger value="recent">
              <History className="mr-2 h-4 w-4" />
              Recent Games
            </TabsTrigger>
            <TabsTrigger value="import">
              <Upload className="mr-2 h-4 w-4" />
              Import PGN
            </TabsTrigger>
            <TabsTrigger value="search">
              <Search className="mr-2 h-4 w-4" />
              Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recent">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                <Card className="bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">
                      Recent Games
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {recentGames.length > 0 ? (
                        recentGames.map((game) => (
                          <button
                            key={game.id}
                            className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${selectedGame?.id === game.id ? "bg-primary/10" : ""}`}
                            onClick={() => handleGameSelect(game)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                {game.opponent}
                              </span>
                              <span
                                className={`text-sm ${getResultClass(game.result)}`}
                              >
                                {game.result}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {game.date}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          {isLoading
                            ? "Loading games..."
                            : "No recent games found"}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-3">
                {selectedGame ? (
                  <div className="space-y-6">
                    <Card className="bg-white shadow-md">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-xl font-bold">
                            Game vs {selectedGame.opponent}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2 py-1 rounded-full text-sm ${getResultClass(selectedGame.result)} bg-opacity-10 ${getResultClass(selectedGame.result).replace("text", "bg")}`}
                            >
                              {selectedGame.result}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleShareAnalysis}
                            >
                              <Share2 className="h-4 w-4 mr-1" />
                              Share
                            </Button>
                            <Button
                              variant={isAnalyzing ? "default" : "outline"}
                              size="sm"
                              onClick={startFullGameAnalysis}
                              disabled={isAnalyzing}
                            >
                              <Cpu className="h-4 w-4 mr-1" />
                              {isAnalyzing
                                ? `Analyzing ${analysisProgress}%`
                                : "Analyze Game"}
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedGame.date}
                        </div>
                      </CardHeader>
                    </Card>

                    <AnalysisBoard
                      pgn={selectedGame.pgn}
                      gameId={selectedGame.id}
                      moves={selectedGame.moves}
                      onAnalysisComplete={handleAnalysisComplete}
                    />
                  </div>
                ) : (
                  <Card className="bg-white shadow-md p-6 text-center">
                    <div className="flex flex-col items-center justify-center py-10">
                      <BarChart3 className="h-16 w-16 text-gray-300 mb-4" />
                      <h3 className="text-xl font-medium mb-2">
                        No Game Selected
                      </h3>
                      <p className="text-muted-foreground max-w-md">
                        Select a game from your recent games or import a PGN to
                        analyze
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Import PGN</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePgnSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pgn">Paste PGN</Label>
                    <Textarea
                      id="pgn"
                      placeholder="Paste your PGN here..."
                      rows={10}
                      value={pgnInput}
                      onChange={(e) => setPgnInput(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={!pgnInput.trim()}>
                      <FileUp className="mr-2 h-4 w-4" />
                      Analyze PGN
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search">
            <Card className="bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-lg font-bold">
                  Search Games
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="opponent">Opponent</Label>
                    <Input id="opponent" placeholder="Opponent username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-from">From Date</Label>
                    <Input id="date-from" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-to">To Date</Label>
                    <Input id="date-to" type="date" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="result">Result</Label>
                    <Select>
                      <SelectTrigger id="result">
                        <SelectValue placeholder="Any result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any result</SelectItem>
                        <SelectItem value="win">Wins</SelectItem>
                        <SelectItem value="loss">Losses</SelectItem>
                        <SelectItem value="draw">Draws</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time-control">Time Control</Label>
                    <Select>
                      <SelectTrigger id="time-control">
                        <SelectValue placeholder="Any time control" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any time control</SelectItem>
                        <SelectItem value="bullet">Bullet</SelectItem>
                        <SelectItem value="blitz">Blitz</SelectItem>
                        <SelectItem value="rapid">Rapid</SelectItem>
                        <SelectItem value="classical">Classical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opening">Opening</Label>
                    <Input id="opening" placeholder="Opening name" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>
                    <Search className="mr-2 h-4 w-4" />
                    Search Games
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Analysis;
