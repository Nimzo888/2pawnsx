import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  GraduationCap,
  Users,
  User,
  BarChart,
  Crown,
  Menu,
  LogOut,
  Settings,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  username?: string;
  avatarUrl?: string;
  isPremium?: boolean;
}

const Navbar = ({ username, avatarUrl, isPremium = false }: NavbarProps) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState(3);

  // Use profile data if available, otherwise fallback to props
  const displayName =
    profile?.username || username || user?.user_metadata?.username || "Player";
  const displayAvatar =
    avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || "chess"}`;

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <nav className="w-full h-16 px-4 bg-background border-b border-border flex items-center justify-between fixed top-0 z-50 shadow-sm backdrop-blur-sm bg-background/90">
      <div className="flex items-center space-x-2">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-primary rounded-full p-1.5">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold hidden sm:inline-block">
            2pawns
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <div className="hidden md:flex items-center space-x-1">
        <NavItem
          to="/play"
          icon={<GraduationCap className="h-4 w-4 mr-2" />}
          label="Play"
          active={location.pathname === "/play"}
        />
        <NavItem
          to="/social"
          icon={<Users className="h-4 w-4 mr-2" />}
          label="Social"
          active={location.pathname === "/social"}
        />
        <NavItem
          to="/profile"
          icon={<User className="h-4 w-4 mr-2" />}
          label="Profile"
          active={location.pathname === "/profile"}
        />
        <NavItem
          to="/analysis"
          icon={<BarChart className="h-4 w-4 mr-2" />}
          label="Analysis"
          active={location.pathname === "/analysis"}
        />
      </div>

      {/* Right Side - User Menu & Premium Status */}
      <div className="flex items-center space-x-2">
        {isPremium && (
          <div className="hidden sm:flex items-center space-x-1 bg-amber-500/20 text-amber-500 px-2 py-1 rounded-full text-xs">
            <Crown className="h-3 w-3" />
            <span>Premium</span>
          </div>
        )}

        {user && (
          <Button
            variant="ghost"
            size="icon"
            className="relative mr-2"
            onClick={() => navigate("/notifications")}
          >
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                variant="destructive"
              >
                {notifications}
              </Badge>
            )}
          </Button>
        )}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={displayAvatar} alt={displayName} />
                  <AvatarFallback>
                    {displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/analysis")}>
                <BarChart className="mr-2 h-4 w-4" />
                <span>Stats</span>
              </DropdownMenuItem>
              {!isPremium && (
                <DropdownMenuItem>
                  <Crown className="mr-2 h-4 w-4" />
                  <span>Upgrade to Premium</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/login")}>
              Sign in
            </Button>
            <Button onClick={() => navigate("/register")}>Sign up</Button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate("/play")}>
                <GraduationCap className="mr-2 h-4 w-4" />
                <span>Play</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/social")}>
                <Users className="mr-2 h-4 w-4" />
                <span>Social</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/analysis")}>
                <BarChart className="mr-2 h-4 w-4" />
                <span>Analysis</span>
              </DropdownMenuItem>
              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavItem = ({ to, icon, label, active = false }: NavItemProps) => {
  const location = useLocation();
  const isActive = active || location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {icon}
      {label}
    </Link>
  );
};

export default Navbar;
