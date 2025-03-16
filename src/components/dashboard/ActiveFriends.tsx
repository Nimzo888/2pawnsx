import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CircleUser, Swords } from "lucide-react";

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "playing" | "idle";
  eloRating: number;
}

interface ActiveFriendsProps {
  friends?: Friend[];
  onChallenge?: (friendId: string) => void;
}

const ActiveFriends = ({
  friends = [
    {
      id: "1",
      name: "Magnus Carlsen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=magnus",
      status: "online",
      eloRating: 2850,
    },
    {
      id: "2",
      name: "Hikaru Nakamura",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=hikaru",
      status: "playing",
      eloRating: 2780,
    },
    {
      id: "3",
      name: "Fabiano Caruana",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fabiano",
      status: "online",
      eloRating: 2810,
    },
    {
      id: "4",
      name: "Anish Giri",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=anish",
      status: "idle",
      eloRating: 2760,
    },
  ],
  onChallenge = (friendId) =>
    console.log(`Challenged friend with ID: ${friendId}`),
}: ActiveFriendsProps) => {
  const getStatusColor = (status: Friend["status"]) => {
    switch (status) {
      case "online":
        return "bg-secondary";
      case "playing":
        return "bg-amber-500";
      case "idle":
        return "bg-muted-foreground";
      default:
        return "bg-muted-foreground";
    }
  };

  const getStatusText = (status: Friend["status"]) => {
    switch (status) {
      case "online":
        return "Online";
      case "playing":
        return "In Game";
      case "idle":
        return "Idle";
      default:
        return "Offline";
    }
  };

  return (
    <Card className="w-full bg-card border border-border shadow-card hover:shadow-card-hover transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CircleUser className="h-5 w-5 text-primary" />
          Active Friends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {friends.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active friends at the moment
            </p>
          ) : (
            friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={friend.avatar} alt={friend.name} />
                      <AvatarFallback>
                        {friend.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(friend.status)}`}
                      title={getStatusText(friend.status)}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{friend.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ELO: {friend.eloRating}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1 hover:bg-primary/10 hover:text-primary"
                  onClick={() => onChallenge(friend.id)}
                  disabled={friend.status === "playing"}
                >
                  <Swords className="h-4 w-4" />
                  Challenge
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveFriends;
