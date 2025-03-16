import React from "react";
import SocialFeed from "../social/SocialFeed";
import ActivityPanel from "./ActivityPanel";

// Default mock data for the activity panel
const defaultActivityPanelData = {
  userStats: {
    eloRating: 1250,
    winRate: 58,
    totalGames: 124,
    winStreak: 3,
    ratingTrend: "up" as const,
  },
  activeFriends: [
    {
      id: "friend1",
      name: "Anna Rudolf",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anna",
      status: "online" as const,
      eloRating: 1850,
    },
    {
      id: "friend2",
      name: "Daniel Naroditsky",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=daniel",
      status: "playing" as const,
      eloRating: 2650,
    },
    {
      id: "friend3",
      name: "Eric Rosen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=eric",
      status: "idle" as const,
      eloRating: 2350,
    },
  ],
  recentGames: [
    {
      id: "game1",
      opponent: {
        name: "Benjamin Finegold",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=benjamin",
      },
      result: "win" as const,
      timeControl: "10+5",
      date: "Today",
      eloChange: 8,
    },
    {
      id: "game2",
      opponent: {
        name: "Qiyu Zhou",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=qiyu",
      },
      result: "loss" as const,
      timeControl: "5+3",
      date: "Yesterday",
      eloChange: -6,
    },
    {
      id: "game3",
      opponent: {
        name: "Andras Toth",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=andras",
      },
      result: "draw" as const,
      timeControl: "15+10",
      date: "2 days ago",
      eloChange: 0,
    },
  ],
  subscriptionStatus: "free" as const,
};

interface DashboardLayoutProps {
  children?: React.ReactNode;
  socialFeedData?: React.ComponentProps<typeof SocialFeed>["posts"];
  activityPanelData?: {
    userStats?: React.ComponentProps<typeof ActivityPanel>["userStats"];
    activeFriends?: React.ComponentProps<typeof ActivityPanel>["activeFriends"];
    recentGames?: React.ComponentProps<typeof ActivityPanel>["recentGames"];
    subscriptionStatus?: React.ComponentProps<
      typeof ActivityPanel
    >["subscriptionStatus"];
  };
}

const DashboardLayout = ({
  children,
  socialFeedData,
  activityPanelData = defaultActivityPanelData,
}: DashboardLayoutProps) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-6 bg-background">
      {children}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Social Feed - Takes up 2/3 of the space on larger screens */}
        <div className="lg:col-span-2">
          <SocialFeed posts={socialFeedData} />
        </div>

        {/* Activity Panel - Takes up 1/3 of the space on larger screens */}
        <div className="lg:col-span-1">
          <ActivityPanel
            userStats={activityPanelData.userStats}
            activeFriends={activityPanelData.activeFriends}
            recentGames={activityPanelData.recentGames}
            subscriptionStatus={activityPanelData.subscriptionStatus}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
