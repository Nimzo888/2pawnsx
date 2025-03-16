import React, { useState, useEffect, useRef } from "react";
import Chessboard from "./Chessboard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Settings,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface ResponsiveChessboardProps {
  fen: string;
  orientation?: "white" | "black";
  onMove?: (move: { from: string; to: string; promotion?: string }) => void;
  highlightedSquares?: Array<{ square: string; type: "move" | "good" | "bad" }>;
  lastMove?: { from: string; to: string };
  interactive?: boolean;
  showCoordinates?: boolean;
  showMoveHints?: boolean;
  className?: string;
}

const ResponsiveChessboard = ({
  fen,
  orientation = "white",
  onMove,
  highlightedSquares = [],
  lastMove,
  interactive = true,
  showCoordinates = true,
  showMoveHints = true,
  className = "",
}: ResponsiveChessboardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(400);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settings, setSettings] = useState({
    showCoordinates,
    showMoveHints,
    highlightLastMove: true,
    highlightValidMoves: true,
    boardTheme: "default", // default, wood, blue, green
    pieceTheme: "default", // default, neo, alpha, chess24
    moveSound: true,
  });

  // Calculate board size based on container width
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        // For mobile, use almost full width
        if (window.innerWidth < 640) {
          setBoardSize(Math.min(window.innerWidth - 32, 400));
        } else {
          // For larger screens, use container width or max 600px
          const containerWidth = containerRef.current.clientWidth;
          setBoardSize(Math.min(containerWidth, 600));
        }
      }
    };

    // Initial size
    updateSize();

    // Update on resize
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (document.fullscreenElement && containerRef.current) {
        // When entering fullscreen, adjust board size
        const minDimension = Math.min(window.innerWidth, window.innerHeight);
        setBoardSize(minDimension - 100); // Leave some space for controls
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable fullscreen mode: ${err.message}`,
        );
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const zoomIn = () => {
    setBoardSize((prev) => Math.min(prev + 50, 800));
  };

  const zoomOut = () => {
    setBoardSize((prev) => Math.max(prev - 50, 200));
  };

  const flipBoard = () => {
    // This would typically update the orientation prop via a callback
    // For this component, we'll just log it
    console.log("Flip board requested");
  };

  const updateSettings = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Apply board theme class
  const getBoardThemeClass = () => {
    switch (settings.boardTheme) {
      case "wood":
        return "board-theme-wood";
      case "blue":
        return "board-theme-blue";
      case "green":
        return "board-theme-green";
      default:
        return "";
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center ${className} ${isFullscreen ? "fixed inset-0 z-50 bg-background flex items-center justify-center" : ""}`}
    >
      <div className={`mb-2 ${getBoardThemeClass()}`}>
        <Chessboard
          fen={fen}
          orientation={orientation}
          size={boardSize}
          onMove={onMove}
          highlightedSquares={highlightedSquares}
          lastMove={lastMove}
          interactive={interactive}
          showCoordinates={settings.showCoordinates}
        />
      </div>

      {/* Mobile-friendly controls */}
      <div className="flex flex-wrap justify-center gap-2 mt-2 w-full">
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={flipBoard}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Flip Board</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={zoomOut}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom Out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={zoomIn}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom In</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>Board Settings</DrawerTitle>
                <DrawerDescription>
                  Customize your chess board appearance and behavior
                </DrawerDescription>
              </DrawerHeader>
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Appearance</h4>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-coordinates" className="flex-1">
                      Show coordinates
                    </Label>
                    <Switch
                      id="show-coordinates"
                      checked={settings.showCoordinates}
                      onCheckedChange={(checked) =>
                        updateSettings("showCoordinates", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="highlight-last-move" className="flex-1">
                      Highlight last move
                    </Label>
                    <Switch
                      id="highlight-last-move"
                      checked={settings.highlightLastMove}
                      onCheckedChange={(checked) =>
                        updateSettings("highlightLastMove", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="highlight-valid-moves" className="flex-1">
                      Highlight valid moves
                    </Label>
                    <Switch
                      id="highlight-valid-moves"
                      checked={settings.highlightValidMoves}
                      onCheckedChange={(checked) =>
                        updateSettings("highlightValidMoves", checked)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Board Theme</h4>
                  <div className="flex flex-wrap gap-2">
                    {["default", "wood", "blue", "green"].map((theme) => (
                      <Badge
                        key={theme}
                        variant={
                          settings.boardTheme === theme ? "default" : "outline"
                        }
                        className="cursor-pointer capitalize"
                        onClick={() => updateSettings("boardTheme", theme)}
                      >
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Piece Style</h4>
                  <div className="flex flex-wrap gap-2">
                    {["default", "neo", "alpha", "chess24"].map((theme) => (
                      <Badge
                        key={theme}
                        variant={
                          settings.pieceTheme === theme ? "default" : "outline"
                        }
                        className="cursor-pointer capitalize"
                        onClick={() => updateSettings("pieceTheme", theme)}
                      >
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
};

export default ResponsiveChessboard;
