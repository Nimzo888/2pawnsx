import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  UserPlus,
  MessageSquare,
  Swords,
  X,
  Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";

interface Friend {
  id: string;
  username: string;
  avatar_url?: string;
  status: "online" | "offline" | "playing";
  elo_rating?: number;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender?: {
    username: string;
    avatar_url?: string;
  };
}

const FriendsList = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [user]);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      // Get follows where the current user is the follower
      const { data, error } = await supabase
        .from("follows")
        .select(
          "following_id, following:profiles!follows_following_id_fkey(id, username, avatar_url, elo_rating)",
        )
        .eq("follower_id", user?.id);

      if (error) throw error;

      if (data) {
        const friendsList = data.map((item) => ({
          id: item.following.id,
          username: item.following.username,
          avatar_url: item.following.avatar_url,
          elo_rating: item.following.elo_rating,
          status: "offline" as "online" | "offline" | "playing", // Default status
        }));
        setFriends(friendsList);

        // Subscribe to presence for online status
        // This would be implemented with Supabase Realtime
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("friend_requests")
        .select(
          "*, sender:profiles!friend_requests_sender_id_fkey(username, avatar_url)",
        )
        .eq("receiver_id", user?.id)
        .eq("status", "pending");

      if (error) throw error;

      if (data) {
        setFriendRequests(data);
      }
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, elo_rating")
        .ilike("username", `%${searchQuery}%`)
        .neq("id", user?.id)
        .limit(10);

      if (error) throw error;

      if (data) {
        // Filter out users who are already friends
        const friendIds = friends.map((friend) => friend.id);
        const filteredResults = data
          .filter((result) => !friendIds.includes(result.id))
          .map((result) => ({
            ...result,
            status: "offline" as "online" | "offline" | "playing",
          }));
        setSearchResults(filteredResults);
      }
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (friendId: string) => {
    try {
      const { error } = await supabase.from("friend_requests").insert({
        sender_id: user?.id,
        receiver_id: friendId,
        status: "pending",
      });

      if (error) throw error;

      // Update UI to show request sent
      setSearchResults((prev) =>
        prev.filter((result) => result.id !== friendId),
      );
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  const acceptFriendRequest = async (requestId: string, senderId: string) => {
    try {
      // Update request status
      const { error: updateError } = await supabase
        .from("friend_requests")
        .update({ status: "accepted" })
        .eq("id", requestId);

      if (updateError) throw updateError;

      // Create mutual follow relationships
      const { error: followError } = await supabase.from("follows").insert([
        {
          follower_id: user?.id,
          following_id: senderId,
        },
        {
          follower_id: senderId,
          following_id: user?.id,
        },
      ]);

      if (followError) throw followError;

      // Update UI
      setFriendRequests((prev) =>
        prev.filter((request) => request.id !== requestId),
      );
      fetchFriends(); // Refresh friends list
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("friend_requests")
        .update({ status: "rejected" })
        .eq("id", requestId);

      if (error) throw error;

      // Update UI
      setFriendRequests((prev) =>
        prev.filter((request) => request.id !== requestId),
      );
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      // Remove both follow relationships
      const { error } = await supabase
        .from("follows")
        .delete()
        .or(`follower_id.eq.${user?.id},following_id.eq.${friendId}`)
        .or(`follower_id.eq.${friendId},following_id.eq.${user?.id}`);

      if (error) throw error;

      // Update UI
      setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  return (
    <Card className="w-full h-full bg-card shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Friends</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="friends">My Friends</TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {friendRequests.length > 0 && (
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  {friendRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="add">Add Friends</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="p-4">
            <ScrollArea className="h-[400px]">
              {friends.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>You don't have any friends yet.</p>
                  <p className="text-sm mt-2">
                    Search for users to add them as friends.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={friend.avatar_url} />
                            <AvatarFallback>
                              {friend.username.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${friend.status === "online" ? "bg-secondary" : friend.status === "playing" ? "bg-amber-500" : "bg-muted-foreground"}`}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{friend.username}</p>
                          <p className="text-xs text-muted-foreground">
                            ELO: {friend.elo_rating || 1200}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Send message"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Challenge to a game"
                        >
                          <Swords className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          title="Remove friend"
                          onClick={() => removeFriend(friend.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="requests" className="p-4">
            <ScrollArea className="h-[400px]">
              {friendRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No pending friend requests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {friendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.sender?.avatar_url} />
                          <AvatarFallback>
                            {request.sender?.username.substring(0, 2) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {request.sender?.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Sent a friend request
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-secondary"
                          onClick={() =>
                            acceptFriendRequest(request.id, request.sender_id)
                          }
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => rejectFriendRequest(request.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="add" className="p-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                  variant="outline"
                  onClick={handleSearch}
                  disabled={loading || !searchQuery.trim()}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="h-[350px]">
                {searchResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Search for users to add them as friends.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.map((result) => (
                      <div
                        key={result.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={result.avatar_url} />
                            <AvatarFallback>
                              {result.username.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{result.username}</p>
                            <p className="text-xs text-muted-foreground">
                              ELO: {result.elo_rating || 1200}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendFriendRequest(result.id)}
                          className="flex items-center gap-1"
                        >
                          <UserPlus className="h-4 w-4" />
                          Add Friend
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FriendsList;
