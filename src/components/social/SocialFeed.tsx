import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Image, GamepadIcon, Trophy, TrendingUp } from "lucide-react";
import PostCard from "./PostCard";

interface SocialFeedProps {
  posts?: Array<{
    id: string;
    user: {
      name: string;
      username: string;
      avatar: string;
    };
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
    shares: number;
    hasGameSnippet?: boolean;
    gameResult?: "win" | "loss" | "draw";
    opponent?: string;
  }>;
}

const SocialFeed = ({ posts = defaultPosts }: SocialFeedProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [postContent, setPostContent] = useState("");

  const handleCreatePost = () => {
    // This would handle post creation in a real implementation
    console.log("Creating post with content:", postContent);
    setPostContent("");
  };

  return (
    <div className="w-full h-full bg-background p-4 rounded-lg overflow-y-auto shadow-inner border border-border">
      <Card className="mb-4 bg-card shadow-card">
        <CardContent className="pt-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
                alt="Your avatar"
              />
              <AvatarFallback>YA</AvatarFallback>
            </Avatar>
            <Textarea
              placeholder="What's on your chess mind?"
              className="flex-1 resize-none bg-muted/50"
              rows={2}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
            />
          </div>
          <Separator className="my-3" />
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex gap-1">
                <Image className="h-4 w-4" />
                <span>Image</span>
              </Button>
              <Button variant="outline" size="sm" className="flex gap-1">
                <GamepadIcon className="h-4 w-4" />
                <span>Game</span>
              </Button>
            </div>
            <Button onClick={handleCreatePost} disabled={!postContent.trim()}>
              Post
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="mb-4">
        <TabsList className="w-full grid grid-cols-4 bg-muted/50">
          <TabsTrigger value="all" onClick={() => setActiveTab("all")}>
            All
          </TabsTrigger>
          <TabsTrigger value="games" onClick={() => setActiveTab("games")}>
            Games
          </TabsTrigger>
          <TabsTrigger value="friends" onClick={() => setActiveTab("friends")}>
            Friends
          </TabsTrigger>
          <TabsTrigger
            value="trending"
            onClick={() => setActiveTab("trending")}
          >
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </TabsContent>

        <TabsContent value="games" className="mt-4 space-y-4">
          {posts
            .filter((post) => post.hasGameSnippet)
            .map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
        </TabsContent>

        <TabsContent value="friends" className="mt-4 space-y-4">
          {posts
            .filter((_, index) => index % 2 === 0) // Just a mock filter for friends posts
            .map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
        </TabsContent>

        <TabsContent value="trending" className="mt-4 space-y-4">
          {posts
            .filter((post) => post.likes > 100) // Mock filter for trending posts
            .map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
        </TabsContent>
      </Tabs>

      {posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="bg-muted p-4 rounded-full mb-4">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No posts to show</h3>
          <p className="text-muted-foreground max-w-md">
            Follow more players or create your first post to see content here.
          </p>
        </div>
      )}
    </div>
  );
};

// Default mock data for the social feed
const defaultPosts = [
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
  {
    id: "4",
    user: {
      name: "Levy Rozman",
      username: "gothamchess",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=levy",
    },
    content:
      "New video is up! 'Top 10 Chess Openings You Must Know' - check it out and let me know what opening you want me to cover next.",
    timestamp: "2 days ago",
    likes: 324,
    comments: 98,
    shares: 45,
    hasGameSnippet: false,
  },
];

export default SocialFeed;
