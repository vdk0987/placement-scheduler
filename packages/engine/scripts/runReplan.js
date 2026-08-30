import { generateDataset } from "../generator.js";

import { createTimeGrid } from "../timeGrid.js";

import { buildSchedule } from "../scheduler.js";

import { computeMetrics } from "../metrics.js";

import { replan } from "../replan.js";

console.log("\nGenerating initial schedule...");

const dataset = generateDataset(42);

const timeGrid = createTimeGrid();

const initial = buildSchedule(dataset, timeGrid);

let state = {
  schedule: initial.schedule,

  unscheduled: initial.unscheduled,

  cancelled: [],

  metrics: computeMetrics({
    schedule: initial.schedule,

    unscheduled: initial.unscheduled,

    rooms: dataset.rooms,

    config: {
      totalDays: 4,

      dayStartTime: "09:00",

      dayEndTime: "19:00",

      minimumStudentBufferMinutes: 10,
    },
  }),
};

console.log("\nBefore disruption:");

console.log({
  scheduled: state.schedule.length,

  unscheduled: state.unscheduled.length,
});

const result = replan({
  event: {
    type: "companyLate",

    companyId: "company-01",

    hours: 3,
  },

  currentState: state,

  dataset,
  timeGrid,
});

state = result.state;

console.log("\n========== REPLAN DIFF ==========\n");

console.log(JSON.stringify(result.diff, null, 2));

console.log("\nAfter disruption:");

console.log({
  scheduled: state.schedule.length,

  unscheduled: state.unscheduled.length,

  cancelled: state.cancelled.length,

  churn: result.diff.metrics,
});
