import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  Share,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";

interface PostCardProps {
  user?: {
    name: string;
    username: string;
    avatar: string;
  };
  content?: string;
  timestamp?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  hasGameSnippet?: boolean;
  gameResult?: "win" | "loss" | "draw";
  opponent?: string;
}

const PostCard = ({
  user = {
    name: "Magnus Carlsen",
    username: "magnuscarlsen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=magnus",
  },
  content = "Just finished an amazing game against Hikaru! Check out this interesting position from our match. #ChessLife #Tactics",
  timestamp = "2 hours ago",
  likes = 142,
  comments = 38,
  shares = 12,
  hasGameSnippet = true,
  gameResult = "win",
  opponent = "Hikaru Nakamura",
}: PostCardProps) => {
  // Function to determine the color for game result badge
  const getResultColor = (result: string) => {
    switch (result) {
      case "win":
        return "bg-secondary/20 text-secondary";
      case "loss":
        return "bg-destructive/20 text-destructive";
      case "draw":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="w-full bg-card border border-border shadow-card hover:shadow-card-hover transition-all social-card">
      <CardHeader className="flex flex-row items-start space-y-0 gap-3 pb-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-base">{user.name}</h3>
              <p className="text-sm text-muted-foreground">
                @{user.username} · {timestamp}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-base mb-3">{content}</p>

        {hasGameSnippet && (
          <div className="rounded-lg border border-border p-3 mb-2 bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-5 bg-card rounded-full flex items-center justify-center">
                <span className="text-primary text-xs font-bold">♞</span>
              </div>
              <span className="font-medium">Game vs {opponent}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full ml-auto ${getResultColor(gameResult)}`}
              >
                {gameResult.charAt(0).toUpperCase() + gameResult.slice(1)}
              </span>
            </div>
            <div className="bg-muted h-48 rounded flex items-center justify-center chess-piece-bg">
              <p className="text-muted-foreground text-sm">
                Chess board visualization would appear here
              </p>
            </div>
            <div className="mt-2 text-sm text-muted-foreground flex justify-between items-center">
              <span className="font-medium">Final position</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs flex items-center gap-1 h-7 px-2"
              >
                View full game
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-border pt-3">
        <div className="flex justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <Heart className="h-4 w-4" />
            <span>{likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{comments}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-1 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <Share className="h-4 w-4" />
            <span>{shares}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
