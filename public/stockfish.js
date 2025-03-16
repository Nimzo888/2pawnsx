// Stockfish.js Web Worker implementation
self.onmessage = function (e) {
  const command = e.data;

  if (command === "uci") {
    self.postMessage("id name Stockfish 16\nid author Stockfish Team\nuciok");
  } else if (command === "isready") {
    self.postMessage("readyok");
  } else if (command.startsWith("position fen")) {
    // Store position (in a real implementation)
    self.postMessage("info string position set");
  } else if (command.startsWith("go depth")) {
    // Mock analysis response
    setTimeout(() => {
      self.postMessage(
        "info depth 10 seldepth 12 multipv 1 score cp 24 nodes 15400 nps 38500 tbhits 0 time 400 pv e2e4 e7e5 g1f3 b8c6",
      );
    }, 500);

    setTimeout(() => {
      self.postMessage(
        "info depth 15 seldepth 20 multipv 1 score cp 32 nodes 45600 nps 38000 tbhits 0 time 1200 pv e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6",
      );
    }, 1200);

    setTimeout(() => {
      self.postMessage(
        "info depth 18 seldepth 24 multipv 1 score cp 28 nodes 98700 nps 37800 tbhits 0 time 2600 pv e2e4 e7e5 g1f3 b8c6 f1b5 a7a6 b5a4 g8f6 e1g1 f8e7",
      );
      self.postMessage("bestmove e2e4 ponder e7e5");
    }, 2000);
  } else if (command === "stop") {
    self.postMessage("bestmove e2e4 ponder e7e5");
  }
};

// Notify that the worker is loaded
self.postMessage("info string Stockfish.js loaded");
