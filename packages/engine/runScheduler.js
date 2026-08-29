import path from "node:path"
import {generateDataset} from "./generator.js"
import {createTimeGrid} from "./timeGrid.js"
import {buildSchedule} from "./scheduler.js"

const SEED = 42;

console.log("\nGenerating dataset...");

const dataset = generateDataset(SEED);

console.log("Creating time grid...");

const timeGrid = createTimeGrid();

console.log("Scheduling interviews...");

const result = buildSchedule(dataset, timeGrid);

console.log("\n========== RESULTS ==========\n");

console.log(`Total requests: ${result.metadata.totalRequests}`);

console.log(`Scheduled: ${result.metadata.scheduled}`);

console.log(`Unscheduled: ${result.metadata.unscheduled}`);

console.log("\nSample scheduled interviews:");

console.table(
  result.schedule.slice(0, 10).map((interview) => ({
    companyId: interview.companyId,

    studentId: interview.studentId,

    day: interview.day,

    start: interview.startTime,

    room: interview.roomId,

    panel: interview.panelId,
  })),
);

console.log("\nUnscheduled reasons:");

const reasons = {};

for (const interview of result.unscheduled) {
  reasons[interview.reason] = (reasons[interview.reason] || 0) + 1;
}

console.table(reasons);
