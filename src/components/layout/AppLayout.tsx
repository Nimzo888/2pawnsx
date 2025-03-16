import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import { analytics } from "@/lib/analytics";
import { Toaster } from "@/components/ui/toaster";
import SkipLink from "@/components/a11y/SkipLink";
import KeyboardFocusOutline from "@/components/a11y/KeyboardFocusOutline";

const AppLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Initialize analytics and track page views
  useEffect(() => {
    if (user) {
      analytics.init(user.id);
    } else {
      analytics.init();
    }
  }, [user]);

  // Track page views
  useEffect(() => {
    const pageName = location.pathname.split("/").pop() || "home";
    analytics.trackPageView(pageName, { path: location.pathname });
  }, [location]);

  return (
    <>
      <KeyboardFocusOutline />
      <SkipLink targetId="main-content" />

      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main id="main-content" className="flex-1 pt-16">
          <Outlet />
        </main>
        <Toaster />
      </div>
    </>
  );
};

export default AppLayout;
