import { generateDataset } from "./generator.js";
import { createTimeGrid } from "./timeGrid.js";
import { buildSchedule } from "./scheduler.js";
import { computeMetrics } from "./metrics.js";

console.log("\nGenerating dataset...");

const dataset = generateDataset({
  seed: 67,
});

console.log("Creating time grid...");

const timeGrid = createTimeGrid();

console.log("Creating interview requests...");

const { schedule, unscheduled } = buildSchedule(dataset, timeGrid);

console.log("Computing feasibility and metrics...");

const metrics = computeMetrics({
  schedule,
  unscheduled,

  rooms: dataset.rooms,

  config: {
    totalDays: 4,

    dayStartTime: "09:00",

    dayEndTime: "17:00",

    minimumStudentBufferMinutes: 10,

    preferredStartTime: "09:00",

    preferredEndTime: "17:00",
  },
});

console.log("\n========== RESULTS ==========");

console.log(`\nTotal requests: ${metrics.summary.totalRequests}`);

console.log(`Scheduled: ${metrics.summary.scheduled}`);

console.log(`Unscheduled: ${metrics.summary.unscheduled}`);

console.log(`Schedule rate: ${metrics.summary.scheduleRate}%`);

console.log("\n========== FEASIBILITY ==========");

console.log(`Feasible: ${metrics.feasibility.isFeasible}`);

console.log(`Hard constraint clashes: ${metrics.feasibility.clashCount}`);

console.log("\n========== ROOM UTILIZATION ==========");

console.table(
  Object.entries(metrics.roomUtilization.byDay).map(([day, data]) => ({
    day,

    bookedMinutes: data.bookedMinutes,

    availableMinutes: data.availableMinutes,

    utilization: `${data.utilizationPercent}%`,
  })),
);

console.log("\nOverall room utilization:");

console.log(`${metrics.roomUtilization.overall.utilizationPercent}%`);

console.log("\n========== STUDENT WAIT TIME ==========");

console.log(
  `Students with 2+ interviews: ${
    metrics.studentWaitTime.studentsWithMultipleInterviews
  }`,
);

console.log(
  `Average wait time: ${metrics.studentWaitTime.averageWaitMinutes} minutes`,
);

console.log("\n========== SOFT CONSTRAINT NEAR MISSES ==========");

console.log(`Near misses: ${metrics.nearMisses.count}`);

console.log("\n========== CONSTRAINT POLICY ==========");

console.log("\nHard constraints:");

for (const constraint of metrics.policy.hard) {
  console.log(`  - ${constraint.description}`);
}

console.log("\nSoft constraints:");

for (const constraint of metrics.policy.soft) {
  console.log(`  - ${constraint.description}`);
}

console.log("\n========== SAMPLE SCHEDULE ==========");

console.table(
  schedule.slice(0, 10).map((item) => ({
    companyId: item.companyId,

    studentId: item.studentId,

    day: item.day,

    start: item.startTime,

    duration: item.durationMinutes,

    room: item.roomId,

    panel: item.panelId,
  })),
);

console.log("\n========== UNSCHEDULED REASONS ==========");

const reasonCounts = unscheduled.reduce((counts, item) => {
  const reason = item.reason || "unknown";

  counts[reason] = (counts[reason] || 0) + 1;

  return counts;
}, {});

console.table(reasonCounts);
