import { SCHEDULING_CONFIG } from "./types.js";

export function createScheduleState() {
  return {
    roomOccupancy: new Map(),
    panelOccupancy: new Map(),
    studentOccupancy: new Map(),
  };
}

export function scheduleAll(requests, rooms, timeGrid, indexes) {
  const state = createScheduleState();
  const schedule = [];
  const unscheduled = [];

  const context = {
    timeGrid,
    state,
    rooms,
    ...indexes,
  };

  const prioritizedRequests = prioritize(requests);

  for (const request of prioritizedRequests) {
    const slot = findFeasibleSlot(request, context);

    if (slot) {
      const interview = commitAssignment(request, slot, state);

      schedule.push(interview);
    } else {
      const reason = explainFailure(request, context);

      unscheduled.push({
        ...request,
        status: SCHEDULING_CONFIG.INTERVIEW_STATUS.UNSCHEDULED,
        reason,
      });
    }
  }

  return {
    schedule,
    unscheduled,
    state,
  };
}

export function buildSchedule(dataset, timeGrid) {
  const indexes = buildIndexes(dataset);
  const requests = createInterviewRequests(dataset);

  const result = scheduleAll(
    requests,
    dataset.rooms,
    timeGrid,
    indexes,
  );

  return {
    ...result,
    metadata: {
      totalRequests: requests.length,
      scheduled: result.schedule.length,
      unscheduled: result.unscheduled.length,
    },
  };
}
