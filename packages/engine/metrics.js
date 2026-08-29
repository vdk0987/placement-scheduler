import { validateSchedule } from "./feasibility.js";
import { CONSTRAINT_POLICY } from "./policy.js";
import { computeRoomUtilization, computeStudentWaitTime, computeNearMisses, computeSchedulingMetrics } from "./helper/computeMetrics.js";

export function computeMetrics({ schedule, unscheduled, rooms, config = {} }) {
  const totalRequests = schedule.length + unscheduled.length;

  const feasibility = validateSchedule(schedule);

  const scheduling = computeSchedulingMetrics(schedule, unscheduled);

  const roomUtilization = computeRoomUtilization({
    schedule,
    rooms,
    config,
  });

  const studentWaitTime = computeStudentWaitTime(schedule);

  const nearMisses = computeNearMisses({
    schedule,
    config,
  });

  return {
    generatedAt: new Date().toISOString(),

    policy: CONSTRAINT_POLICY,

    scheduling,

    roomUtilization,

    studentWaitTime,

    feasibility: {
      clashCount: feasibility.clashCount,
      isFeasible: feasibility.isFeasible,
      clashes: feasibility.clashes,
    },

    nearMisses,

    replanChurn: {
      moved: 0,
      affected: 0,
      rate: 0,
    },

    summary: {
      totalRequests,
      scheduled: schedule.length,
      unscheduled: unscheduled.length,
      scheduleRate: scheduling.percentScheduled,
      clashCount: feasibility.clashCount,
      nearMissCount: nearMisses.count,
    },
  };
}
