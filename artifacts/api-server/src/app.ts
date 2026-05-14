import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { existsSync } from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(express.json());
app.use(cors());
app.use(pinoHttp({ logger }));

// API Routes
app.use("/api", router);

// Serve the built React frontend when STATIC_FILES_PATH is set (production/Docker)
const staticPath = process.env["STATIC_FILES_PATH"];
if (staticPath && existsSync(staticPath)) {
  app.use(express.static(staticPath));
  
  // Catch-all: serve index.html for client-side routing
  app.get("*path", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

export default app;
