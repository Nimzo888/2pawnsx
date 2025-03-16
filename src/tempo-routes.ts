// This file provides routes for Tempo storyboards
// It's imported conditionally in App.tsx when VITE_TEMPO is true

const routes = [
  {
    path: "/tempobook/*",
    element: null, // This will be handled by Tempo internally
  },
];

export default routes;
