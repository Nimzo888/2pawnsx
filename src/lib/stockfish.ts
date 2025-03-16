// Stockfish integration for chess analysis

type StockfishCallback = (info: StockfishInfo) => void;

export interface StockfishInfo {
  depth?: number;
  score?: {
    value: number;
    type: "cp" | "mate";
  };
  pv?: string[];
  bestMove?: string;
}

class StockfishService {
  private worker: Worker | null = null;
  private isReady = false;
  private callbacks: StockfishCallback[] = [];
  private currentFen: string | null = null;
  private analysisDepth = 18;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== "undefined") {
      try {
        this.worker = new Worker("/stockfish.js");
        this.worker.onmessage = this.handleMessage.bind(this);
        this.worker.onerror = (error) => {
          console.error("Stockfish worker error:", error);
        };
        this.sendCommand("uci");
        this.sendCommand("isready");
      } catch (error) {
        console.error("Failed to initialize Stockfish:", error);
      }
    }
  }

  private handleMessage(event: MessageEvent) {
    const message = event.data;

    if (message.includes("readyok")) {
      this.isReady = true;
      // Configure Stockfish
      this.sendCommand("setoption name Threads value 4");
      this.sendCommand("setoption name Hash value 128");
    } else if (message.includes("bestmove")) {
      const bestMove = message.split(" ")[1];
      this.notifyCallbacks({ bestMove });
    } else if (message.includes("info depth")) {
      this.parseInfo(message);
    }
  }

  private parseInfo(info: string) {
    const parts = info.split(" ");
    const result: StockfishInfo = {};

    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === "depth" && i + 1 < parts.length) {
        result.depth = parseInt(parts[i + 1]);
      } else if (parts[i] === "score" && i + 2 < parts.length) {
        const type = parts[i + 1] as "cp" | "mate";
        const value = parseInt(parts[i + 2]);
        result.score = { type, value };
      } else if (parts[i] === "pv" && i + 1 < parts.length) {
        const pv = [];
        for (let j = i + 1; j < parts.length; j++) {
          if (parts[j].includes("bmc") || parts[j].includes("string")) break;
          pv.push(parts[j]);
        }
        result.pv = pv;
      }
    }

    if (Object.keys(result).length > 0) {
      this.notifyCallbacks(result);
    }
  }

  private notifyCallbacks(info: StockfishInfo) {
    this.callbacks.forEach((callback) => callback(info));
  }

  private sendCommand(command: string) {
    if (this.worker) {
      this.worker.postMessage(command);
    }
  }

  public setPosition(fen: string) {
    if (!this.isReady || !this.worker) return;
    this.currentFen = fen;
    this.sendCommand(`position fen ${fen}`);
  }

  public analyze(callback: StockfishCallback) {
    if (!this.isReady || !this.worker || !this.currentFen) return;

    this.callbacks.push(callback);
    this.sendCommand(`go depth ${this.analysisDepth}`);
  }

  public stopAnalysis() {
    if (!this.isReady || !this.worker) return;
    this.sendCommand("stop");
    this.callbacks = [];
  }

  public setAnalysisDepth(depth: number) {
    this.analysisDepth = Math.min(Math.max(depth, 1), 24); // Limit depth between 1 and 24
  }

  public destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isReady = false;
    this.callbacks = [];
  }
}

// Singleton instance
export const stockfish = new StockfishService();
