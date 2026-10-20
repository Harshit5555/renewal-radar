import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { accountsRouter } from "./routes/accounts.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { tasksRouter } from "./routes/tasks.js";
import { ImportError } from "./services/importService.js";

// Lets async route handlers pass thrown errors to the error handler (Express 4).
const wrapAsync = (router) => {
  for (const layer of router.stack) {
    for (const routeLayer of layer.route?.stack ?? []) {
      const handler = routeLayer.handle;
      routeLayer.handle = (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
    }
  }
  return router;
};

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "5mb" }));

  app.use("/api/accounts", wrapAsync(accountsRouter));
  app.use("/api/tasks", wrapAsync(tasksRouter));
  app.use("/api/dashboard", wrapAsync(dashboardRouter));

  app.use((err, _req, res, _next) => {
    if (err instanceof mongoose.Error.ValidationError || err instanceof ImportError) {
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
    }
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}
