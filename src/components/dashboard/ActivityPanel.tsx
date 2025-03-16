import React from "react";
import { Card } from "@/components/ui/card";
import UserStatsSummary from "./UserStatsSummary";
import ActiveFriends from "./ActiveFriends";
import RecentGames from "./RecentGames";
import SubscriptionCard from "../subscription/SubscriptionCard";

interface ActivityPanelProps {
  userStats?: {
    eloRating?: number;
    winRate?: number;
    totalGames?: number;
    winStreak?: number;
    ratingTrend?: "up" | "down" | "stable";
  };
  activeFriends?: Array<{
    id: string;
    name: string;
    avatar?: string;
    status: "online" | "playing" | "idle";
    eloRating: number;
  }>;
  recentGames?: Array<{
    id: string;
    opponent: {
      name: string;
      avatar: string;
    };
    result: "win" | "loss" | "draw";
    timeControl: string;
    date: string;
    eloChange: number;
  }>;
  subscriptionStatus?: "free" | "premium";
  onChallengePlayer?: (friendId: string) => void;
  onUpgradeSubscription?: () => void;
}

const ActivityPanel = ({
  userStats,
  activeFriends,
  recentGames,
  subscriptionStatus = "free",
  onChallengePlayer = (friendId) =>
    console.log(`Challenged player: ${friendId}`),
  onUpgradeSubscription = () => console.log("Upgrade subscription clicked"),
}: ActivityPanelProps) => {
  return (
    <Card className="w-full h-full bg-background p-4 overflow-y-auto shadow-inner border border-border">
      <div className="space-y-6">
        {/* User Stats Summary */}
        <UserStatsSummary {...userStats} />

        {/* Active Friends */}
        <ActiveFriends
          friends={activeFriends}
          onChallenge={onChallengePlayer}
        />

        {/* Recent Games */}
        <RecentGames games={recentGames} />

        {/* Subscription Card */}
        <SubscriptionCard
          status={subscriptionStatus}
          onUpgrade={onUpgradeSubscription}
        />
      </div>
    </Card>
  );
};

export default ActivityPanel;
