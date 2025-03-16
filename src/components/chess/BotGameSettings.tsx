import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Cpu, Clock, Brain } from "lucide-react";

interface BotGameSettingsProps {
  onStartGame: (settings: {
    level: number;
    timeControl: { minutes: number; increment: number };
    playAs: "white" | "black" | "random";
    enableAnalysis: boolean;
  }) => void;
}

const BotGameSettings = ({ onStartGame }: BotGameSettingsProps) => {
  const [level, setLevel] = useState(3);
  const [timeControl, setTimeControl] = useState<string>("5+3");
  const [playAs, setPlayAs] = useState<"white" | "black" | "random">("white");
  const [enableAnalysis, setEnableAnalysis] = useState(false);

  const handleStartGame = () => {
    // Parse time control
    const [minutes, increment] = timeControl.split("+").map(Number);

    onStartGame({
      level,
      timeControl: { minutes, increment },
      playAs,
      enableAnalysis,
    });
  };

  const getLevelDescription = (level: number) => {
    switch (level) {
      case 1:
        return "Beginner - Suitable for new players";
      case 2:
        return "Casual - Makes occasional mistakes";
      case 3:
        return "Intermediate - Plays solid chess";
      case 4:
        return "Advanced - Challenging for club players";
      case 5:
        return "Expert - Strong tactical play";
      case 6:
        return "Master - Very few mistakes";
      case 7:
        return "Grandmaster - Extremely difficult";
      case 8:
        return "Superhuman - Maximum strength";
      default:
        return "Intermediate - Plays solid chess";
    }
  };

  return (
    <Card className="w-full bg-card shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          Play Against Computer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bot Level */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Bot Strength: Level {level}</Label>
            <span className="text-sm text-muted-foreground">
              ~{1000 + level * 200} ELO
            </span>
          </div>
          <Slider
            value={[level]}
            min={1}
            max={8}
            step={1}
            onValueChange={(value) => setLevel(value[0])}
          />
          <p className="text-sm text-muted-foreground">
            {getLevelDescription(level)}
          </p>
        </div>

        {/* Time Control */}
        <div className="space-y-3">
          <Label>Time Control</Label>
          <RadioGroup
            value={timeControl}
            onValueChange={setTimeControl}
            className="grid grid-cols-3 gap-2"
          >
            {/* Bullet Options */}
            <div>
              <RadioGroupItem value="1+0" id="tc-1" className="peer sr-only" />
              <Label
                htmlFor="tc-1"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Clock className="mb-1 h-4 w-4" />
                <span className="text-sm font-medium">Bullet</span>
                <span className="text-xs text-muted-foreground">1+0</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="1+1"
                id="tc-1-1"
                className="peer sr-only"
              />
              <Label
                htmlFor="tc-1-1"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Clock className="mb-1 h-4 w-4" />
                <span className="text-sm font-medium">Bullet</span>
                <span className="text-xs text-muted-foreground">1+1</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="2+1"
                id="tc-2-1"
                className="peer sr-only"
              />
              <Label
                htmlFor="tc-2-1"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Clock className="mb-1 h-4 w-4" />
                <span className="text-sm font-medium">Bullet</span>
                <span className="text-xs text-muted-foreground">2+1</span>
              </Label>
            </div>

            {/* Blitz Options */}
            <div>
              <RadioGroupItem
                value="3+0"
                id="tc-3-0"
                className="peer sr-only"
              />
              <Label
                htmlFor="tc-3-0"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Clock className="mb-1 h-4 w-4" />
                <span className="text-sm font-medium">Blitz</span>
                <span className="text-xs text-muted-foreground">3+0</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="3+2"
                id="tc-3-2"
                className="peer sr-only"
              />
              <Label
                htmlFor="tc-3-2"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Clock className="mb-1 h-4 w-4" />
                <span className="text-sm font-medium">Blitz</span>
                <span className="text-xs text-muted-foreground">3+2</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="5+0"
                id="tc-5-0"
                className="peer sr-only"
              />
              <Label
                htmlFor="tc-5-0"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Clock className="mb-1 h-4 w-4" />
                <span className="text-sm font-medium">Blitz</span>
                <span className="text-xs text-muted-foreground">5+0</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="5+3"
                id="tc-5-3"
                className="peer sr-only"
              />
              <Label
                htmlFor="tc-5-3"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Clock className="mb-1 h-4 w-4" />
                <span className="text-sm font-medium">Blitz</span>
                <span className="text-xs text-muted-foreground">5+3</span>
              </Label>
            </div>

            {/* Rapid Options */}
            <div>
              <RadioGroupItem
                value="10+0"
                id="tc-10-0"
                className="peer sr-only"
              />
              <Label
                htmlFor="tc-10-0"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Clock className="mb-1 h-4 w-4" />
                <span className="text-sm font-medium">Rapid</span>
                <span className="text-xs text-muted-foreground">10+0</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="10+5"
                id="tc-10-5"
                className="peer sr-only"
              />
              <Label
                htmlFor="tc-10-5"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Clock className="mb-1 h-4 w-4" />
                <span className="text-sm font-medium">Rapid</span>
                <span className="text-xs text-muted-foreground">10+5</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="15+10"
                id="tc-15-10"
                className="peer sr-only"
              />
              <Label
                htmlFor="tc-15-10"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Clock className="mb-1 h-4 w-4" />
                <span className="text-sm font-medium">Rapid</span>
                <span className="text-xs text-muted-foreground">15+10</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Play as */}
        <div className="space-y-3">
          <Label>Play as</Label>
          <RadioGroup
            value={playAs}
            onValueChange={(value: "white" | "black" | "random") =>
              setPlayAs(value)
            }
            className="grid grid-cols-3 gap-2"
          >
            <div>
              <RadioGroupItem
                value="white"
                id="color-1"
                className="peer sr-only"
              />
              <Label
                htmlFor="color-1"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <div className="h-4 w-4 rounded-full bg-white border border-gray-300 mb-1" />
                <span className="text-sm font-medium">White</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="black"
                id="color-2"
                className="peer sr-only"
              />
              <Label
                htmlFor="color-2"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <div className="h-4 w-4 rounded-full bg-black border border-gray-300 mb-1" />
                <span className="text-sm font-medium">Black</span>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="random"
                id="color-3"
                className="peer sr-only"
              />
              <Label
                htmlFor="color-3"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <div className="h-4 w-4 rounded-full bg-gradient-to-r from-white to-black border border-gray-300 mb-1" />
                <span className="text-sm font-medium">Random</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Enable Analysis */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label
              htmlFor="enable-analysis"
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Enable Live Analysis
            </Label>
            <p className="text-xs text-muted-foreground">
              See Stockfish evaluation during the game
            </p>
          </div>
          <Switch
            id="enable-analysis"
            checked={enableAnalysis}
            onCheckedChange={setEnableAnalysis}
          />
        </div>

        <Button className="w-full mt-4" size="lg" onClick={handleStartGame}>
          Start Game
        </Button>
      </CardContent>
    </Card>
  );
};

export default BotGameSettings;
