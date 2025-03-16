import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Trophy, Award, Clock, Calendar, Edit2, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { Textarea } from "@/components/ui/textarea";
import { Tabs2 } from "@/components/ui/tabs2";
import { ChessGame } from "@/components/chess/ChessGame";
import { ChessPuzzle } from "@/components/chess/ChessPuzzle";
import { ChessStats } from "@/components/chess/ChessStats";
import { ChessAchievements } from "@/components/chess/ChessAchievements";
import ProfileTabs from "@/components/profile/ProfileTabs";
import GameHistory from "@/components/profile/GameHistory";
import ProfilePicture from "@/components/profile/ProfilePicture";

const Profile = () => {
  const { user, profile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || user?.user_metadata?.username || "");
      setBio(profile.bio || "");
    }
  }, [profile, user]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>
            Please log in to view your profile.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    try {
      setError(null);
      if (!username.trim()) {
        setError("Username cannot be empty");
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          username,
          bio,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    }
  };

  // Mock data for the enhanced profile components
  const mockStats = {
    elo: profile?.elo_rating || 1200,
    gamesPlayed: profile?.games_played || 0,
    wins: profile?.wins || 0,
    losses: profile?.losses || 0,
    draws: profile?.draws || 0,
    winRate: profile?.games_played
      ? Math.round((profile.wins / profile.games_played) * 100)
      : 0,
    averageGameLength: 32,
    favoriteOpening: "Sicilian Defense",
    longestWinStreak: 3,
    currentStreak: 1,
    puzzlesSolved: 42,
    puzzleRating: 1350,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Profile Summary */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary to-primary/60 relative">
                <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              <div className="px-6 pb-6">
                <div className="flex justify-center">
                  <ProfilePicture size="xl" editable={true} />
                </div>
                <div className="mt-4 text-center">
                  <h2 className="text-2xl font-bold">
                    {username ||
                      profile?.username ||
                      user?.user_metadata?.username ||
                      "User"}
                  </h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex justify-center mt-2 space-x-2">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Trophy className="h-3 w-3" />
                      {profile?.elo_rating || 1200} ELO
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Award className="h-3 w-3" />
                      {profile?.games_played || 0} Games
                    </Badge>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="font-bold text-xl">{profile?.wins || 0}</p>
                      <p className="text-xs text-muted-foreground">Wins</p>
                    </div>
                    <div>
                      <p className="font-bold text-xl">{profile?.draws || 0}</p>
                      <p className="text-xs text-muted-foreground">Draws</p>
                    </div>
                    <div>
                      <p className="font-bold text-xl">
                        {profile?.losses || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Losses</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Joined{" "}
                    {new Date(
                      profile?.created_at || Date.now(),
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Chess Stats Card */}
            <ChessStats stats={mockStats} />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <Tabs2 defaultValue="overview" className="w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="puzzles">Puzzles</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 gap-6">
                {/* About Me Card */}
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>About Me</CardTitle>
                      {!isEditing && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(true)}
                        >
                          <Edit2 className="h-4 w-4 mr-2" /> Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell the chess world about yourself..."
                            className="min-h-[120px]"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleSaveProfile}>
                            <Save className="h-4 w-4 mr-2" /> Save
                          </Button>
                        </div>
                        {error && (
                          <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        {success && (
                          <Alert>
                            <AlertDescription>{success}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-muted-foreground">
                          {bio ||
                            "No bio provided yet. Click Edit to add your chess story!"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Game History */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Recent Games</h3>
                    <Button variant="outline" size="sm">
                      View All Games
                    </Button>
                  </div>
                  <GameHistory userId={user.id} limit={2} showFilters={false} />
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[1, 2, 3].map((_, i) => (
                        <div key={i} className="flex items-start space-x-4">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <Clock className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {
                                [
                                  "Won a game against Magnus",
                                  "Solved 5 puzzles in a row",
                                  "Analyzed your game with Beth",
                                ][i]
                              }
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(
                                Date.now() - 1000 * 60 * 60 * 24 * i,
                              ).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="games">
              <div className="space-y-6">
                <ProfileTabs userId={user.id} isOwnProfile={true} />
              </div>
            </TabsContent>

            <TabsContent value="puzzles">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Puzzle History</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Filter by Theme
                    </Button>
                    <Button variant="outline" size="sm">
                      Sort by Difficulty
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <ChessPuzzle
                      key={`puzzle-${index}`}
                      puzzle={{
                        id: `p${index}`,
                        rating: 1200 + index * 50,
                        theme: [
                          "Fork",
                          "Pin",
                          "Mate in 2",
                          "Discovery",
                          "Skewer",
                          "Zugzwang",
                        ][index % 6],
                        timeSpent: 30 + index * 10,
                        solved: index % 3 !== 0,
                        date: new Date(
                          Date.now() - 1000 * 60 * 60 * 24 * index,
                        ).toISOString(),
                      }}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="achievements">
              <ChessAchievements />
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email || ""} disabled />
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-md font-medium mb-2">
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">
                          Current Password
                        </Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">
                          Confirm Password
                        </Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                      <Button>Update Password</Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-md font-medium mb-2">
                      Notification Preferences
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications">
                            Email Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive game invites and updates via email
                          </p>
                        </div>
                        <Switch id="email-notifications" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="friend-requests">
                            Friend Requests
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications for new friend requests
                          </p>
                        </div>
                        <Switch id="friend-requests" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="game-reminders">Game Reminders</Label>
                          <p className="text-sm text-muted-foreground">
                            Get reminders for scheduled games
                          </p>
                        </div>
                        <Switch id="game-reminders" defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-md font-medium mb-2">
                      Privacy Settings
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="public-profile">Public Profile</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow others to view your profile
                          </p>
                        </div>
                        <Switch id="public-profile" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="show-rating">Show Rating</Label>
                          <p className="text-sm text-muted-foreground">
                            Display your ELO rating on your profile
                          </p>
                        </div>
                        <Switch id="show-rating" defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="game-history">
                            Public Game History
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Make your game history visible to others
                          </p>
                        </div>
                        <Switch id="game-history" defaultChecked />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs2>
        </div>
      </div>
    </div>
  );
};

export default Profile;
