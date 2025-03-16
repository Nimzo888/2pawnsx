import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { initSentry } from "./lib/sentry";
import { registerServiceWorker } from "./lib/serviceWorker";
import { setupHmr } from "./lib/hmr-handler";

// Initialize Sentry
initSentry();

// Register service worker for offline support and PWA functionality
registerServiceWorker().then((registered) => {
  if (registered) {
    console.log("Service worker registered successfully");
  }
});

// Set up custom HMR handler to bypass SWC refresh issues
if (import.meta.env.DEV) {
  setupHmr();
}

// Import the dev tools and initialize them
import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
