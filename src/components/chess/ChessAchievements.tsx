import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, Zap, Target, Crown } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: "trophy" | "award" | "star" | "zap" | "target" | "crown";
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  date?: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
}

interface ChessAchievementsProps {
  achievements?: Achievement[];
}

export function ChessAchievements({
  achievements = [],
}: ChessAchievementsProps) {
  // Default achievements if none provided
  const defaultAchievements: Achievement[] = [
    {
      id: "first-win",
      title: "First Victory",
      description: "Win your first chess game",
      icon: "trophy",
      unlocked: true,
      date: "2023-05-15",
      rarity: "common",
    },
    {
      id: "win-streak",
      title: "On Fire",
      description: "Win 5 games in a row",
      icon: "zap",
      unlocked: false,
      progress: 2,
      maxProgress: 5,
      rarity: "uncommon",
    },
    {
      id: "puzzle-master",
      title: "Puzzle Master",
      description: "Solve 100 puzzles",
      icon: "target",
      unlocked: false,
      progress: 42,
      maxProgress: 100,
      rarity: "rare",
    },
    {
      id: "elo-1500",
      title: "Rising Star",
      description: "Reach 1500 ELO rating",
      icon: "star",
      unlocked: false,
      progress: 1200,
      maxProgress: 1500,
      rarity: "epic",
    },
    {
      id: "grandmaster",
      title: "Grandmaster",
      description: "Reach 2000 ELO rating",
      icon: "crown",
      unlocked: false,
      progress: 1200,
      maxProgress: 2000,
      rarity: "legendary",
    },
  ];

  const displayAchievements =
    achievements.length > 0 ? achievements : defaultAchievements;

  // Sort achievements: unlocked first (by date), then locked by progress percentage
  const sortedAchievements = [...displayAchievements].sort((a, b) => {
    if (a.unlocked && b.unlocked) {
      // Both unlocked, sort by date (most recent first)
      return (
        new Date(b.date || "").getTime() - new Date(a.date || "").getTime()
      );
    } else if (a.unlocked) {
      return -1; // a is unlocked, b is not
    } else if (b.unlocked) {
      return 1; // b is unlocked, a is not
    } else {
      // Both locked, sort by progress percentage
      const aProgress =
        a.progress && a.maxProgress ? a.progress / a.maxProgress : 0;
      const bProgress =
        b.progress && b.maxProgress ? b.progress / b.maxProgress : 0;
      return bProgress - aProgress;
    }
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "trophy":
        return <Trophy className="h-5 w-5" />;
      case "award":
        return <Award className="h-5 w-5" />;
      case "star":
        return <Star className="h-5 w-5" />;
      case "zap":
        return <Zap className="h-5 w-5" />;
      case "target":
        return <Target className="h-5 w-5" />;
      case "crown":
        return <Crown className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-slate-200 text-slate-700";
      case "uncommon":
        return "bg-green-100 text-green-700";
      case "rare":
        return "bg-blue-100 text-blue-700";
      case "epic":
        return "bg-purple-100 text-purple-700";
      case "legendary":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-200 text-slate-700";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`flex items-start space-x-4 p-3 rounded-lg ${achievement.unlocked ? "bg-muted/50" : "bg-background"}`}
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${achievement.unlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
              >
                {getIcon(achievement.icon)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{achievement.title}</h4>
                  <Badge
                    variant="outline"
                    className={getRarityColor(achievement.rarity)}
                  >
                    {achievement.rarity.charAt(0).toUpperCase() +
                      achievement.rarity.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {achievement.description}
                </p>
                {!achievement.unlocked &&
                  achievement.progress !== undefined &&
                  achievement.maxProgress !== undefined && (
                    <div className="mt-2">
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {achievement.progress} / {achievement.maxProgress}
                      </p>
                    </div>
                  )}
                {achievement.unlocked && achievement.date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Unlocked on{" "}
                    {new Date(achievement.date).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
