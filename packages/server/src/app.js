import express from "express";
import cors from "cors";

import { env } from "./config/env.js";
import { createScheduleRouter } from "./routes/schedule.routes.js";
import { createUnscheduledRouter } from "./routes/unscheduled.routes.js";
import { createMetricsRouter } from "./routes/metrics.routes.js";
import { createReplanRouter } from "./routes/replan.routes.js";
import { createReplanController } from "./controllers/replan.controller.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";

export function createApp({ store, websocketServer }) {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
    }),
  );

  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({
      success: true,
      status: "ok",
    });
  });

  app.use("/api/schedule", createScheduleRouter(store));

  app.use("/api/unscheduled", createUnscheduledRouter(store));

  app.use("/api/metrics", createMetricsRouter(store));

  const replanController = createReplanController({
    store,
    websocketServer,
  });

  app.use("/api/replan", createReplanRouter(replanController));

  app.use(notFound);

  app.use(errorHandler);

  return app;
}
