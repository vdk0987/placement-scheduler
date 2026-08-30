import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  scheduleAll,
  computeMetrics,
  createTimeGrid,
} from "../../engine/index.js";

import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { ScheduleStore } from "./state/scheduleStore.js";

import { SchedulerWebSocketServer } from "./websocket/websocket.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const DATASET_PATH = path.resolve(__dirname, "../../../data/seed.json");

function loadDataset() {
  const raw = fs.readFileSync(DATASET_PATH, "utf-8");

  return JSON.parse(raw);
}

function createInitialState(dataset) {
  const { companies, students, rooms } = dataset;

  const timeGrid = createTimeGrid();

  const result = scheduleAll({
    companies,
    students,
    rooms,
    timeGrid,
  });

  const metrics = computeMetrics({
    schedule: result.schedule,
    unscheduled: result.unscheduled,
    rooms,
  });

  return {
    companies,
    students,
    rooms,
    schedule: result.schedule,
    unscheduled: result.unscheduled,
    metrics,
  };
}

const dataset = loadDataset();

console.log("Creating initial schedule...");

const initialState = createInitialState(dataset);

console.log("Initial schedule ready:", {
  scheduled: initialState.schedule.length,

  unscheduled: initialState.unscheduled.length,
});

const store = new ScheduleStore(initialState);

const placeholderApp = (req, res) => {
  res.statusCode = 503;
  res.end("Server starting");
};

const httpServer = http.createServer(placeholderApp);

const websocketServer = new SchedulerWebSocketServer(httpServer);

const app = createApp({
  store,
  websocketServer,
});

/*
 * Replace the temporary request handler.
 */

httpServer.removeAllListeners("request");
httpServer.on("request", app);

httpServer.listen(env.PORT, () => {
  console.log(`
Placement Scheduler API running

HTTP: http://localhost:${env.PORT}
WS:   ws://localhost:${env.PORT}/ws

Health:
GET /health
    `);
});
