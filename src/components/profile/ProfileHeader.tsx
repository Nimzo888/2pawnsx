import React from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProfilePicture from "./ProfilePicture";
import { Edit, Settings } from "lucide-react";

interface ProfileHeaderProps {
  userId?: string;
  isCurrentUser?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  userId,
  isCurrentUser = true,
}) => {
  const { profile } = useAuth();

  // If no userId is provided and it's the current user, use the logged-in user's profile
  const displayedProfile = profile;

  if (!displayedProfile) return null;

  return (
    <Card className="w-full bg-white shadow-sm border-0">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <ProfilePicture size="xl" editable={isCurrentUser} />

          <div className="flex-1 space-y-2 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {displayedProfile.username}
                </h2>
                <p className="text-muted-foreground">
                  ELO Rating: {displayedProfile.elo_rating}
                </p>
              </div>

              {isCurrentUser ? (
                <div className="flex gap-2 justify-center md:justify-start">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 justify-center md:justify-start">
                  <Button variant="default" size="sm">
                    Follow
                  </Button>
                  <Button variant="outline" size="sm">
                    Challenge
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-center md:justify-start gap-6 pt-2">
              <div className="text-center">
                <p className="font-medium">{displayedProfile.games_played}</p>
                <p className="text-sm text-muted-foreground">Games</p>
              </div>
              <div className="text-center">
                <p className="font-medium">{displayedProfile.wins}</p>
                <p className="text-sm text-muted-foreground">Wins</p>
              </div>
              <div className="text-center">
                <p className="font-medium">{displayedProfile.losses}</p>
                <p className="text-sm text-muted-foreground">Losses</p>
              </div>
              <div className="text-center">
                <p className="font-medium">{displayedProfile.draws}</p>
                <p className="text-sm text-muted-foreground">Draws</p>
              </div>
            </div>

            {displayedProfile.bio && (
              <p className="text-sm mt-4">{displayedProfile.bio}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
