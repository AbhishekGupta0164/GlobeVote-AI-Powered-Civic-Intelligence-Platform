import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve static frontend in production
import path from "path";
import fs from "fs";

// Determine the correct path to the frontend dist directory
// The API server will be built into artifacts/api-server/dist
// The frontend will be built into artifacts/globevote/dist/public
const frontendDistPath = path.resolve(__dirname, "../../globevote/dist/public");

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  
  // Catch-all route to serve index.html for SPA routing
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(frontendDistPath, "index.html"));
    }
  });
}

export default app;
