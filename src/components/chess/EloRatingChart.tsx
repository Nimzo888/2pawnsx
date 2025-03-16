import React, { useEffect, useState } from "react";
import { eloService } from "../../lib/eloService";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "../../lib/supabase";

interface EloRatingChartProps {
  userId: string;
  limit?: number;
}

interface RatingPoint {
  date: string;
  rating: number;
  formattedDate: string;
}

export function EloRatingChart({ userId, limit = 20 }: EloRatingChartProps) {
  const [ratingHistory, setRatingHistory] = useState<RatingPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProvisional, setIsProvisional] = useState(false);

  useEffect(() => {
    const fetchRatingHistory = async () => {
      setIsLoading(true);
      try {
        // Check if rating is provisional
        const provisional = await eloService.isProvisionalRating(userId);
        setIsProvisional(provisional);

        // Get rating history
        const history = await eloService.getRatingHistory(userId, limit);
        if (!history) {
          setRatingHistory([]);
          return;
        }

        // Get current rating
        const { data: profile } = await supabase
          .from("profiles")
          .select("elo_rating")
          .eq("id", userId)
          .single();

        // Calculate rating points over time
        let currentRating = profile?.elo_rating || 1200;
        const points: RatingPoint[] = [];

        // Add current rating
        points.push({
          date: new Date().toISOString(),
          rating: currentRating,
          formattedDate: new Date().toLocaleDateString(),
        });

        // Process history in reverse (oldest to newest)
        for (let i = history.length - 1; i >= 0; i--) {
          const item = history[i];
          // Subtract the rating change to get the previous rating
          currentRating -= item.ratingChange;

          points.unshift({
            date: item.date,
            rating: currentRating,
            formattedDate: new Date(item.date).toLocaleDateString(),
          });
        }

        setRatingHistory(points);
      } catch (error) {
        console.error("Failed to fetch rating history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchRatingHistory();
    }
  }, [userId, limit]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ELO Rating History</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <Skeleton className="w-full h-[250px]" />
        </CardContent>
      </Card>
    );
  }

  if (ratingHistory.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            ELO Rating{" "}
            {isProvisional && (
              <span className="text-yellow-500 text-sm ml-2">
                (Provisional)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Not enough rated games to display rating history.
            {isProvisional &&
              " Rating is provisional until 30 games are played."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          ELO Rating History{" "}
          {isProvisional && (
            <span className="text-yellow-500 text-sm ml-2">(Provisional)</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={ratingHistory}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="formattedDate"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[
                (dataMin) => Math.floor(dataMin - 50),
                (dataMax) => Math.ceil(dataMax + 50),
              ]}
            />
            <Tooltip
              formatter={(value) => [`${value} ELO`, "Rating"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
