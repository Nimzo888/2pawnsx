import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Swords, Users, Trophy, LineChart } from "lucide-react";

interface QuickActionProps {
  actions?: Array<{
    title: string;
    icon: React.ReactNode;
    description: string;
    onClick?: () => void;
  }>;
}

const QuickActions = ({ actions = [] }: QuickActionProps) => {
  // Default actions if none provided
  const defaultActions = [
    {
      title: "Quick Match",
      icon: <Swords className="h-6 w-6" />,
      description: "Find an opponent and start playing immediately",
      onClick: () => console.log("Quick match clicked"),
    },
    {
      title: "Challenge Friend",
      icon: <Users className="h-6 w-6" />,
      description: "Send a game invitation to a friend",
      onClick: () => console.log("Challenge friend clicked"),
    },
    {
      title: "Join Tournament",
      icon: <Trophy className="h-6 w-6" />,
      description: "Browse and enter available tournaments",
      onClick: () => console.log("Join tournament clicked"),
    },
    {
      title: "Analyze Game",
      icon: <LineChart className="h-6 w-6" />,
      description: "Review and analyze your previous games",
      onClick: () => console.log("Analyze game clicked"),
    },
  ];

  const displayActions = actions.length > 0 ? actions : defaultActions;

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-card p-6 rounded-lg shadow-md border border-border">
      <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayActions.map((action, index) => (
          <Card
            key={index}
            className="hover:shadow-card-hover transition-shadow border border-border bg-muted/30"
          >
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-3">
                {action.icon}
              </div>
              <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {action.description}
              </p>
              <Button
                onClick={action.onClick}
                className="w-full"
                variant="default"
              >
                {action.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
