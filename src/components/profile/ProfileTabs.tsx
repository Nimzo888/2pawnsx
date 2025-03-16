import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ChessStats } from "@/components/chess/ChessStats";
import PlayerAnalytics from "@/components/chess/PlayerAnalytics";
import GameHistory from "@/components/profile/GameHistory";
import { useAuth } from "@/components/auth/AuthProvider";

interface ProfileTabsProps {
  userId: string;
  isOwnProfile: boolean;
}

const ProfileTabs = ({ userId, isOwnProfile }: ProfileTabsProps) => {
  return (
    <Tabs defaultValue="games" className="w-full">
      <TabsList className="grid grid-cols-4 w-full max-w-md mb-6">
        <TabsTrigger value="games">Games</TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="achievements">Achievements</TabsTrigger>
      </TabsList>

      <TabsContent value="games" className="space-y-6">
        <GameHistory userId={userId} showFilters={true} />
      </TabsContent>

      <TabsContent value="stats" className="space-y-6">
        <ChessStats />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <PlayerAnalytics userId={userId} />
      </TabsContent>

      <TabsContent value="achievements" className="space-y-6">
        <Card className="p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">
              Achievements Coming Soon
            </h3>
            <p className="text-muted-foreground">
              Track your chess milestones and earn badges as you improve
            </p>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
