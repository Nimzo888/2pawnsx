import React from "react";
import Navbar from "@/components/layout/Navbar";
import QuickActions from "@/components/dashboard/QuickActions";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Helmet } from "react-helmet";
import { Swords, Users, Trophy, LineChart } from "lucide-react";

interface DashboardProps {
  username?: string;
  avatarUrl?: string;
  isPremium?: boolean;
}

const Dashboard = ({
  username = "ChessMaster",
  avatarUrl = "https://api.dicebear.com/7.x/avataaars/svg?seed=chess",
  isPremium = false,
}: DashboardProps) => {
  // Mock data for social feed posts could be fetched from an API in a real implementation
  const socialFeedData = [
    {
      id: "1",
      user: {
        name: "Magnus Carlsen",
        username: "magnuscarlsen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=magnus",
      },
      content:
        "Just finished an amazing game against Hikaru! Check out this interesting position from our match. #ChessLife #Tactics",
      timestamp: "2 hours ago",
      likes: 142,
      comments: 38,
      shares: 12,
      hasGameSnippet: true,
      gameResult: "win" as "win",
      opponent: "Hikaru Nakamura",
    },
    {
      id: "2",
      user: {
        name: "Alexandra Botez",
        username: "alexandrabotez",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alexandra",
      },
      content:
        "Streaming some bullet chess today! Come join me and let's have some fun. Who's up for a challenge?",
      timestamp: "5 hours ago",
      likes: 89,
      comments: 24,
      shares: 5,
      hasGameSnippet: false,
    },
    {
      id: "3",
      user: {
        name: "Hikaru Nakamura",
        username: "gmhikaru",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hikaru",
      },
      content:
        "Analyzing my recent tournament games. This endgame technique is crucial for improving your rating. What do you think of this position?",
      timestamp: "Yesterday",
      likes: 215,
      comments: 67,
      shares: 31,
      hasGameSnippet: true,
      gameResult: "draw" as "draw",
      opponent: "Fabiano Caruana",
    },
  ];

  // Mock data for activity panel
  const activityPanelData = {
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
        eloRating: 1720,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>Dashboard | 2pawns</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar
          username={username}
          avatarUrl={avatarUrl}
          isPremium={isPremium}
        />
        <main className="container mx-auto px-4 py-6">
          <QuickActions />
          <DashboardLayout
            socialFeedData={socialFeedData}
            activityPanelData={activityPanelData}
          />
        </main>
      </div>
    </>
  );
};

export default Dashboard;
