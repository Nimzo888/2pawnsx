import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, ChevronRight, Check } from "lucide-react";

interface SubscriptionCardProps {
  status?: "free" | "premium";
  features?: string[];
  price?: string;
  onUpgrade?: () => void;
}

const SubscriptionCard = ({
  status = "free",
  features = [
    "Real-time AI feedback",
    "Advanced game analysis",
    "Unlimited game storage",
    "Coach Mode access",
  ],
  price = "$9.99/month",
  onUpgrade = () => console.log("Upgrade clicked"),
}: SubscriptionCardProps) => {
  const isPremium = status === "premium";

  return (
    <Card className="w-full bg-gradient-to-br from-card to-muted border-2 border-border overflow-hidden shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold">
            {isPremium ? "Premium Subscription" : "Free Account"}
          </CardTitle>
          {isPremium && (
            <Badge className="bg-gradient-premium text-white border-0">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        <CardDescription>
          {isPremium
            ? "You have access to all premium features"
            : "Upgrade to unlock premium features"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        {!isPremium && (
          <div className="mb-3">
            <p className="text-sm font-medium">Premium benefits:</p>
            <ul className="mt-1 space-y-1">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="text-xs flex items-center text-muted-foreground"
                >
                  <Check className="h-3 w-3 mr-1 text-secondary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
        {isPremium && (
          <div className="mb-3">
            <p className="text-sm font-medium">Your premium features:</p>
            <ul className="mt-1 space-y-1">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="text-xs flex items-center text-muted-foreground"
                >
                  <Check className="h-3 w-3 mr-1 text-secondary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-muted/50 p-3">
        {!isPremium ? (
          <>
            <div className="text-sm font-medium">{price}</div>
            <Button
              size="sm"
              onClick={onUpgrade}
              className="gap-1 bg-gradient-premium hover:opacity-90"
            >
              Upgrade
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <div className="text-sm">
              <span className="font-medium">Current plan:</span> Premium
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={onUpgrade}
              className="gap-1 border-primary/50 hover:bg-primary/10 hover:text-primary"
            >
              Manage
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default SubscriptionCard;
