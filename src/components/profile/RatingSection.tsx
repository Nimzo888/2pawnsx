import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { RatingBadge } from "../chess/RatingBadge";
import { EloRatingChart } from "../chess/EloRatingChart";
import { eloService } from "../../lib/eloService";
import { supabase } from "../../lib/supabase";

interface RatingSectionProps {
  userId: string;
}

export function RatingSection({ userId }: RatingSectionProps) {
  const [isProvisional, setIsProvisional] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get user profile
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error) throw error;
        setUserProfile(profile);

        // Check if rating is provisional
        const provisional = await eloService.isProvisionalRating(userId);
        setIsProvisional(provisional);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  if (isLoading || !userProfile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Rating Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Rating Information</span>
            <RatingBadge
              rating={userProfile.elo_rating}
              isProvisional={isProvisional}
              className="ml-2"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-muted-foreground">Games Played</p>
              <p className="text-2xl font-bold">{userProfile.games_played}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-muted-foreground">Win Rate</p>
              <p className="text-2xl font-bold">
                {userProfile.games_played > 0
                  ? Math.round(
                      (userProfile.wins / userProfile.games_played) * 100,
                    )
                  : 0}
                %
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-muted-foreground">Record</p>
              <p className="text-2xl font-bold">
                {userProfile.wins}-{userProfile.losses}-{userProfile.draws}
              </p>
            </div>
          </div>

          {isProvisional && (
            <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <span className="font-medium">Provisional Rating:</span> Your
                rating is still provisional until you complete 30 rated games.
                During this period, your rating will fluctuate more
                significantly.
              </p>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>
              Current rating:{" "}
              <span className="font-medium">{userProfile.elo_rating}</span>
            </p>
            <p>
              Games needed for established rating:{" "}
              {Math.max(0, 30 - userProfile.games_played)}
            </p>
          </div>
        </CardContent>
      </Card>

      <EloRatingChart userId={userId} />
    </div>
  );
}
