import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Zap,
  BookOpen,
  Lightbulb,
  Target,
  Puzzle,
  ChevronRight,
} from "lucide-react";
import { analysisService } from "@/lib/analysisService";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";

interface PlayerAnalyticsProps {
  userId?: string; // If not provided, use the current user
}

const PlayerAnalytics = ({ userId }: PlayerAnalyticsProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [playerData, setPlayerData] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [openingStats, setOpeningStats] = useState<any[]>([]);
  const [timeControlStats, setTimeControlStats] = useState<any[]>([]);

  const playerId = userId || user?.id;

  useEffect(() => {
    if (playerId) {
      loadPlayerData();
      loadPlayerInsights();
      loadRecentGames();
      loadOpeningStats();
      loadTimeControlStats();
    }
  }, [playerId]);

  const loadPlayerData = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", playerId)
        .single();

      if (error) throw error;
      setPlayerData(data);
    } catch (error) {
      console.error("Error loading player data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPlayerInsights = async () => {
    try {
      const insights = await analysisService.getPlayerInsights(playerId!);
      setInsights(insights);
    } catch (error) {
      console.error("Error loading player insights:", error);
    }
  };

  const loadRecentGames = async () => {
    try {
      const { data, error } = await supabase
        .from("games")
        .select(
          `
          id, 
          white_player_id, 
          black_player_id, 
          result, 
          created_at, 
          time_control,
          white_profile:profiles!games_white_player_id_fkey(username),
          black_profile:profiles!games_black_player_id_fkey(username),
          game_analysis(white_accuracy, black_accuracy)
        `,
        )
        .or(`white_player_id.eq.${playerId},black_player_id.eq.${playerId}`)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentGames(data || []);
    } catch (error) {
      console.error("Error loading recent games:", error);
    }
  };

  const loadOpeningStats = async () => {
    try {
      // This would be a real query in a production app
      // For now, we'll use mock data
      setOpeningStats([
        { name: "Sicilian Defense", games: 24, winRate: 62, avgAccuracy: 84 },
        { name: "Queen's Gambit", games: 18, winRate: 56, avgAccuracy: 81 },
        { name: "Ruy Lopez", games: 15, winRate: 73, avgAccuracy: 88 },
        { name: "French Defense", games: 12, winRate: 50, avgAccuracy: 79 },
        { name: "King's Indian", games: 10, winRate: 60, avgAccuracy: 82 },
      ]);
    } catch (error) {
      console.error("Error loading opening stats:", error);
    }
  };

  const loadTimeControlStats = async () => {
    try {
      // This would be a real query in a production app
      // For now, we'll use mock data
      setTimeControlStats([
        { name: "Bullet (1+0)", games: 42, winRate: 58, avgAccuracy: 76 },
        { name: "Blitz (3+2)", games: 67, winRate: 64, avgAccuracy: 82 },
        { name: "Rapid (10+5)", games: 31, winRate: 71, avgAccuracy: 87 },
        { name: "Classical (30+20)", games: 12, winRate: 75, avgAccuracy: 91 },
      ]);
    } catch (error) {
      console.error("Error loading time control stats:", error);
    }
  };

  const getResultText = (result: string, isWhite: boolean) => {
    if (!result) return "Ongoing";

    if (result === "1-0") return isWhite ? "Win" : "Loss";
    if (result === "0-1") return isWhite ? "Loss" : "Win";
    return "Draw";
  };

  const getResultClass = (result: string) => {
    if (result.includes("Win")) return "text-secondary";
    if (result.includes("Loss")) return "text-destructive";
    if (result.includes("Draw")) return "text-amber-500";
    return "text-muted-foreground";
  };

  if (isLoading) {
    return (
      <Card className="bg-card shadow-md">
        <CardContent className="py-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-pulse-subtle">Loading player data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!playerData) {
    return (
      <Card className="bg-card shadow-md">
        <CardContent className="py-6">
          <div className="flex justify-center items-center h-40">
            <div className="text-muted-foreground">Player not found</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Player Analytics</CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            AI-Powered
          </Badge>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="openings">Openings</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <TabsContent value="overview" className="mt-0">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Rating</div>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-2 text-2xl font-bold">
                  {playerData.elo_rating || 1200}
                </div>
                <div className="mt-1 text-xs text-secondary flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +45 this month
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Win Rate</div>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-2 text-2xl font-bold">
                  {playerData.games_played
                    ? Math.round(
                        (playerData.wins / playerData.games_played) * 100,
                      )
                    : 0}
                  %
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {playerData.wins || 0}W - {playerData.draws || 0}D -{" "}
                  {playerData.losses || 0}L
                </div>
              </div>

              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-2 text-2xl font-bold">
                  {insights?.averageAccuracy || "--"}%
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Based on {playerData.games_played || 0} analyzed games
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Performance by Time Control
                </h3>
              </div>
              <div className="space-y-2">
                {timeControlStats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{stat.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Games:</span>{" "}
                        {stat.games}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Win Rate:</span>{" "}
                        <span className="text-secondary">{stat.winRate}%</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Accuracy:</span>{" "}
                        {stat.avgAccuracy}%
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Recent Games</h3>
                <Button variant="link" size="sm" className="h-auto p-0">
                  View All
                </Button>
              </div>
              <div className="space-y-2">
                {recentGames.slice(0, 5).map((game, index) => {
                  const isWhite = game.white_player_id === playerId;
                  const opponent = isWhite
                    ? game.black_profile?.username
                    : game.white_profile?.username;
                  const result = getResultText(game.result, isWhite);
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
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors"
                    >
                      <div>
                        <div className="font-medium">vs {opponent}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(game.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge
                          variant="outline"
                          className={`${resultClass} bg-opacity-10`}
                        >
                          {result}
                        </Badge>
                        {accuracy && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Accuracy:
                            </span>{" "}
                            {Math.round(accuracy)}%
                          </div>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="openings" className="mt-0">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Opening Performance</h3>
                <Badge variant="outline">
                  {openingStats.length} openings played
                </Badge>
              </div>
              <div className="space-y-2">
                {openingStats.map((opening, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{opening.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Games:</span>{" "}
                        {opening.games}
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Win Rate:</span>{" "}
                        <span
                          className={
                            opening.winRate > 60 ? "text-secondary" : ""
                          }
                        >
                          {opening.winRate}%
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Accuracy:</span>{" "}
                        {opening.avgAccuracy}%
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Opening Recommendations</h3>
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  AI-Powered
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">For White</h4>
                    <Badge variant="outline" className="text-secondary">
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">
                    Based on your playing style, you might enjoy the{" "}
                    <span className="font-medium">Vienna Game</span>.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Leads to tactical positions with attacking chances
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">For Black</h4>
                    <Badge variant="outline" className="text-secondary">
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">
                    Against 1.e4, consider the{" "}
                    <span className="font-medium">Caro-Kann Defense</span>.
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Solid structure that matches your positional style
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="mt-0">
          {!insights ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Lightbulb className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
              <p className="text-center text-muted-foreground mb-4">
                Get AI-powered insights about your chess style and performance
              </p>
              <Button
                onClick={loadPlayerInsights}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                Generate Insights
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Accuracy
                    </div>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2 text-2xl font-bold">
                    {insights.averageAccuracy}%
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {insights.averageAccuracy > 80
                      ? "Excellent move precision"
                      : insights.averageAccuracy > 70
                        ? "Good move selection"
                        : "Room for improvement"}
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Blunder Rate
                    </div>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2 text-2xl font-bold">
                    {insights.blunderRate} per game
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {insights.blunderRate < 1
                      ? "Very few tactical mistakes"
                      : insights.blunderRate < 2
                        ? "Occasional tactical oversights"
                        : "Focus on reducing blunders"}
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Playing Style
                    </div>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-2 text-xl font-bold">
                    {insights.averageAccuracy > 85
                      ? "Positional"
                      : insights.blunderRate < 1.5
                        ? "Balanced"
                        : "Tactical"}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Based on move selection patterns
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-medium">Strengths & Weaknesses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4 text-secondary" /> Strengths
                    </h4>
                    <ul className="list-disc list-inside text-sm pl-2 space-y-1">
                      {insights.averageAccuracy > 80 && (
                        <li>High accuracy in move selection</li>
                      )}
                      {insights.blunderRate < 1 && (
                        <li>Excellent tactical awareness</li>
                      )}
                      <li>Solid endgame technique</li>
                      <li>Good defensive skills</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-destructive" /> Weaknesses
                    </h4>
                    <ul className="list-disc list-inside text-sm pl-2 space-y-1">
                      {insights.weaknesses.map(
                        (weakness: string, i: number) => (
                          <li key={i}>{weakness}</li>
                        ),
                      )}
                      {insights.weaknesses.length === 0 && (
                        <li>Time management in critical positions</li>
                      )}
                      <li>Complex tactical positions</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-medium">
                  Personalized Recommendations
                </h3>
                <div className="space-y-2">
                  {insights.recommendations.map((rec: string, i: number) => (
                    <div
                      key={i}
                      className="p-3 bg-muted/50 rounded-md flex items-start"
                    >
                      <Lightbulb className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm">{rec}</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-muted/50 rounded-md flex items-start">
                    <Puzzle className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm">
                        Practice tactical puzzles focused on piece coordination
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-md flex items-start">
                    <BookOpen className="h-5 w-5 mr-2 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm">
                        Study endgame principles to convert advantages
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Game History</h3>
              <Badge variant="outline">
                {playerData.games_played || 0} games
              </Badge>
            </div>

            {recentGames.length > 0 ? (
              <div className="space-y-2">
                {recentGames.map((game, index) => {
                  const isWhite = game.white_player_id === playerId;
                  const opponent = isWhite
                    ? game.black_profile?.username
                    : game.white_profile?.username;
                  const result = getResultText(game.result, isWhite);
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
                      className="p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium flex items-center">
                            vs {opponent}{" "}
                            <Badge
                              variant="outline"
                              className="ml-2 capitalize"
                            >
                              {isWhite ? "White" : "Black"}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(game.created_at).toLocaleDateString()}
                            {game.time_control && (
                              <span className="ml-2">
                                {game.time_control.minutes}+
                                {game.time_control.increment}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant="outline"
                            className={`${resultClass} bg-opacity-10`}
                          >
                            {result}
                          </Badge>
                          <Button variant="outline" size="sm">
                            Analyze
                          </Button>
                        </div>
                      </div>
                      {accuracy && (
                        <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Accuracy:
                            </span>{" "}
                            <span
                              className={
                                accuracy > 80
                                  ? "text-secondary"
                                  : accuracy > 60
                                    ? "text-amber-500"
                                    : "text-destructive"
                              }
                            >
                              {Math.round(accuracy)}%
                            </span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              {isWhite ? "White" : "Black"} pieces
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No games found
              </div>
            )}

            {recentGames.length > 0 && (
              <div className="flex justify-center mt-4">
                <Button variant="outline">
                  Load More Games
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  );
};

export default PlayerAnalytics;
