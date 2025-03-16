import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  ChevronRight,
  Search,
  Filter,
  Download,
  Upload,
  Sword,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import ResponsiveChessboard from "@/components/chess/ResponsiveChessboard";

interface GameHistoryProps {
  userId: string;
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

const GameHistory = ({
  userId,
  limit = 10,
  showFilters = true,
  className = "",
}: GameHistoryProps) => {
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [showGamePreview, setShowGamePreview] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
  }, [userId, activeTab]);

  const fetchGames = async () => {
    try {
      setIsLoading(true);

      let query = supabase
        .from("games")
        .select(
          `
          id, 
          white_player_id, 
          black_player_id, 
          result, 
          created_at, 
          time_control,
          pgn,
          initial_fen,
          game_type,
          rated,
          white_profile:profiles!games_white_player_id_fkey(username, avatar_url),
          black_profile:profiles!games_black_player_id_fkey(username, avatar_url),
          game_analysis(white_accuracy, black_accuracy)
        `,
        )
        .or(`white_player_id.eq.${userId},black_player_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      // Apply filters based on active tab
      if (activeTab === "wins") {
        query = query.or(
          `and(white_player_id.eq.${userId},result.eq.1-0),and(black_player_id.eq.${userId},result.eq.0-1)`,
        );
      } else if (activeTab === "losses") {
        query = query.or(
          `and(white_player_id.eq.${userId},result.eq.0-1),and(black_player_id.eq.${userId},result.eq.1-0)`,
        );
      } else if (activeTab === "draws") {
        query = query.eq("result", "1/2-1/2");
      } else if (activeTab === "rated") {
        query = query.eq("rated", true);
      } else if (activeTab === "imported") {
        // Switch to imported PGN table
        const { data: importedGames, error: importError } = await supabase
          .from("imported_pgn")
          .select("*")
          .eq("user_id", userId)
          .order("imported_at", { ascending: false })
          .limit(limit);

        if (importError) throw importError;
        setGames(importedGames || []);
        setIsLoading(false);
        return;
      }

      // Limit the number of results
      query = query.limit(limit);

      const { data, error } = await query;

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getResultText = (game: any) => {
    if (!game.result) return "Ongoing";

    const isWhite = game.white_player_id === userId;

    if (game.result === "1-0") return isWhite ? "Win" : "Loss";
    if (game.result === "0-1") return isWhite ? "Loss" : "Win";
    return "Draw";
  };

  const getResultClass = (result: string) => {
    if (result.includes("Win")) return "text-green-600";
    if (result.includes("Loss")) return "text-red-600";
    if (result.includes("Draw")) return "text-amber-600";
    return "text-blue-600";
  };

  const handleGameSelect = (game: any) => {
    setSelectedGame(game);
    setShowGamePreview(true);
  };

  const handleViewFullAnalysis = (gameId: string) => {
    navigate(`/analysis?gameId=${gameId}`);
  };

  const renderGameItem = (game: any, index: number) => {
    // Handle imported PGN display
    if (activeTab === "imported") {
      return (
        <div
          key={index}
          className="p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors cursor-pointer"
          onClick={() =>
            handleGameSelect({
              ...game,
              isImported: true,
            })
          }
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">{game.name}</div>
              <div className="text-xs text-muted-foreground flex items-center mt-1">
                <Clock className="h-3 w-3 mr-1" />
                {new Date(game.imported_at).toLocaleDateString()}
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    // Handle regular games
    const isWhite = game.white_player_id === userId;
    const opponent = isWhite
      ? game.black_profile?.username || "Anonymous"
      : game.white_profile?.username || "Anonymous";
    const result = getResultText(game);
    const resultClass = getResultClass(result);
    const accuracy =
      game.game_analysis && game.game_analysis[0]
        ? isWhite
          ? game.game_analysis[0].white_accuracy
          : game.game_analysis[0].black_accuracy
        : null;

    return (
      <div
        key={index}
        className="p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors cursor-pointer"
        onClick={() => handleGameSelect(game)}
      >
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium flex items-center">
              vs {opponent}{" "}
              <Badge variant="outline" className="ml-2 capitalize">
                {isWhite ? "White" : "Black"}
              </Badge>
              {game.rated && (
                <Badge
                  variant="outline"
                  className="ml-2 bg-amber-500/10 text-amber-500"
                >
                  Rated
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex items-center mt-1">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(game.created_at).toLocaleDateString()}
              {game.time_control && (
                <span className="ml-2">
                  {game.time_control.minutes}+{game.time_control.increment}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={`${resultClass} bg-opacity-10`}>
              {result}
            </Badge>
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {accuracy !== null && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="text-sm">
              <span className="text-muted-foreground">Accuracy:</span>{" "}
              <span
                className={
                  accuracy > 80
                    ? "text-green-600"
                    : accuracy > 60
                      ? "text-amber-600"
                      : "text-red-600"
                }
              >
                {Math.round(accuracy)}%
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={`bg-card shadow-md ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">Game History</CardTitle>
          {showFilters && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          )}
        </div>

        {showFilters && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid grid-cols-7 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="wins">Wins</TabsTrigger>
              <TabsTrigger value="losses">Losses</TabsTrigger>
              <TabsTrigger value="draws">Draws</TabsTrigger>
              <TabsTrigger value="rated">Rated</TabsTrigger>
              <TabsTrigger value="imported">Imported</TabsTrigger>
              <TabsTrigger value="analyzed">Analyzed</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading games...
            </div>
          ) : games.length > 0 ? (
            games.map((game, index) => renderGameItem(game, index))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              {activeTab === "imported" ? (
                <div className="flex flex-col items-center">
                  <Upload className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                  <p>No imported games found</p>
                  <Button variant="outline" className="mt-4">
                    <Upload className="h-4 w-4 mr-2" />
                    Import PGN
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Sword className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                  <p>No games found</p>
                </div>
              )}
            </div>
          )}

          {games.length > 0 && (
            <div className="flex justify-center mt-4">
              <Button variant="outline">
                Load More Games
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Game Preview Dialog */}
        <Dialog open={showGamePreview} onOpenChange={setShowGamePreview}>
          <DialogContent className="max-w-4xl">
            {selectedGame && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">
                      {selectedGame.isImported ? (
                        selectedGame.name
                      ) : (
                        <>
                          {selectedGame.white_profile?.username || "Anonymous"}{" "}
                          vs{" "}
                          {selectedGame.black_profile?.username || "Anonymous"}
                        </>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(
                        selectedGame.created_at || selectedGame.imported_at,
                      ).toLocaleDateString()}
                      {selectedGame.time_control && (
                        <span className="ml-2">
                          • {selectedGame.time_control.minutes}+
                          {selectedGame.time_control.increment}
                        </span>
                      )}
                      {!selectedGame.isImported && selectedGame.rated && (
                        <span className="ml-2">• Rated</span>
                      )}
                    </p>
                  </div>
                  {!selectedGame.isImported && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewFullAnalysis(selectedGame.id)}
                      >
                        View Full Analysis
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download PGN
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <ResponsiveChessboard
                    fen={
                      selectedGame.initial_fen ||
                      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                    }
                    interactive={false}
                    showCoordinates={true}
                  />
                </div>

                {!selectedGame.isImported &&
                  selectedGame.game_analysis &&
                  selectedGame.game_analysis[0] && (
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-3 bg-muted rounded-md">
                        <div className="text-sm text-muted-foreground mb-1">
                          White Accuracy
                        </div>
                        <div className="text-xl font-bold">
                          {Math.round(
                            selectedGame.game_analysis[0].white_accuracy,
                          )}
                          %
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded-md">
                        <div className="text-sm text-muted-foreground mb-1">
                          Black Accuracy
                        </div>
                        <div className="text-xl font-bold">
                          {Math.round(
                            selectedGame.game_analysis[0].black_accuracy,
                          )}
                          %
                        </div>
                      </div>
                    </div>
                  )}

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleViewFullAnalysis(selectedGame.id)}
                  >
                    Open Full Game
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default GameHistory;
