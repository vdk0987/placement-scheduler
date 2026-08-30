import { SCHEDULING_CONFIG } from "./types.js";

import { DISRUPTION_TYPES, findAffectedInterviews } from "./disruption.js";

import {
  minConflictsRepair,
  buildOccupancyState,
  occupyInterview,
  findBestRepairCandidate,
} from "./repair.js";

import { computeMetrics } from "./metrics.js";
import { computeReplanChurn } from "./helper/metricsHelper.js";

export function replan({ event, currentState, dataset, timeGrid }) {
  const beforeSchedule = structuredClone(currentState.schedule);

  const beforeUnscheduled = structuredClone(currentState.unscheduled);

  switch (event.type) {
    case DISRUPTION_TYPES.COMPANY_LATE:
      return replanCompanyLate({
        event,
        currentState,
        dataset,
        timeGrid,
        beforeSchedule,
      });

    case DISRUPTION_TYPES.PANEL_DROP:
      return replanPanelDrop({
        event,
        currentState,
        dataset,
        timeGrid,
        beforeSchedule,
      });

    case DISRUPTION_TYPES.STUDENT_WITHDRAW:
      return replanStudentWithdraw({
        event,
        currentState,
        dataset,
        timeGrid,
        beforeSchedule,
        beforeUnscheduled,
      });

    case DISRUPTION_TYPES.ROOM_UNAVAILABLE:
      return replanRoomUnavailable({
        event,
        currentState,
        dataset,
        timeGrid,
        beforeSchedule,
      });

    default:
      throw new Error(`Unsupported disruption: ${event.type}`);
  }
}

export function replanCompanyLate({
  event,
  currentState,
  dataset,
  timeGrid,
  beforeSchedule,
}) {
  const affected = findAffectedInterviews(event, currentState.schedule);

  const result = minConflictsRepair({
    interviews: affected,

    schedule: currentState.schedule,

    dataset,
    timeGrid,
    event,
  });

  return finalizeReplan({
    event,
    currentState,
    beforeSchedule,

    directlyAffected: affected,

    repaired: result.repaired,

    stillUnscheduled: result.stillUnscheduled,

    dataset,
  });
}

export function replanPanelDrop({
  event,
  currentState,
  dataset,
  timeGrid,
  beforeSchedule,
}) {
  const affected = findAffectedInterviews(event, currentState.schedule);

  const result = minConflictsRepair({
    interviews: affected,

    schedule: currentState.schedule,

    dataset,
    timeGrid,
    event,
  });

  return finalizeReplan({
    event,
    currentState,
    beforeSchedule,

    directlyAffected: affected,

    repaired: result.repaired,

    stillUnscheduled: result.stillUnscheduled,

    dataset,
  });
}

export function replanRoomUnavailable({
  event,
  currentState,
  dataset,
  timeGrid,
  beforeSchedule,
}) {
  const affected = findAffectedInterviews(event, currentState.schedule);

  const result = minConflictsRepair({
    interviews: affected,

    schedule: currentState.schedule,

    dataset,
    timeGrid,
    event,
  });

  return finalizeReplan({
    event,
    currentState,
    beforeSchedule,

    directlyAffected: affected,

    repaired: result.repaired,

    stillUnscheduled: result.stillUnscheduled,

    dataset,
  });
}

export function replanStudentWithdraw({
  event,
  currentState,
  dataset,
  timeGrid,
  beforeSchedule,
  beforeUnscheduled,
}) {
  const affected = findAffectedInterviews(event, currentState.schedule);

  const affectedIds = new Set(affected.map((item) => item.id));

  const cancelled = affected.map((interview) => ({
    ...interview,

    status: SCHEDULING_CONFIG.INTERVIEW_STATUS.CANCELLED,
  }));

  let schedule = currentState.schedule.filter(
    (interview) => !affectedIds.has(interview.id),
  );

  let unscheduled = beforeUnscheduled.filter(
    (interview) => interview.studentId !== event.studentId,
  );

  const backfill = backfillFreedCapacity({
    schedule,
    unscheduled,
    dataset,
    timeGrid,
  });

  schedule = backfill.schedule;

  unscheduled = backfill.unscheduled;

  const nextState = buildNextState({
    schedule,
    unscheduled,
    cancelled: [...(currentState.cancelled || []), ...cancelled],

    dataset,
  });

  const diff = buildDiff({
    event,

    beforeSchedule,

    afterSchedule: schedule,

    directlyAffected: affected,

    cancelled,

    newlyUnscheduled: [],

    backfilled: backfill.backfilled,
  });

  attachChurn(diff, affected.length);

  return {
    state: nextState,
    diff,
  };
}

function backfillFreedCapacity({ schedule, unscheduled, dataset, timeGrid }) {
  const backfilled = [];

  const remaining = [];

  const companiesById = new Map(
    dataset.companies.map((company) => [company.id, company]),
  );

  const studentsById = new Map(
    dataset.students.map((student) => [student.id, student]),
  );

  const state = buildOccupancyState(schedule);

  for (const interview of unscheduled) {
    const company = companiesById.get(interview.companyId);

    const student = studentsById.get(interview.studentId);

    if (!company || !student) {
      remaining.push(interview);

      continue;
    }

    const best = findBestRepairCandidate({
      interview,

      company,
      student,

      rooms: dataset.rooms,

      timeGrid,

      state,

      schedule,

      event: {
        type: "backfill",
      },
    });

    if (!best) {
      remaining.push(interview);

      continue;
    }

    const updated = {
      ...interview,

      ...best.candidate,

      reason: undefined,

      status: SCHEDULING_CONFIG.INTERVIEW_STATUS.SCHEDULED,
    };

    backfilled.push(updated);

    schedule.push(updated);

    occupyInterview(state, updated);
  }

  return {
    schedule,
    unscheduled: remaining,
    backfilled,
  };
}

function finalizeReplan({
  event,
  currentState,
  beforeSchedule,
  directlyAffected,
  repaired,
  stillUnscheduled,
  dataset,
}) {
  const affectedIds = new Set(directlyAffected.map((item) => item.id));

  const untouched = currentState.schedule.filter(
    (item) => !affectedIds.has(item.id),
  );

  const schedule = [...untouched, ...repaired];

  const newlyUnscheduled = stillUnscheduled.map((interview) => ({
    ...interview,

    status: SCHEDULING_CONFIG.INTERVIEW_STATUS.UNSCHEDULED,
  }));

  const unscheduled = [...currentState.unscheduled, ...newlyUnscheduled];

  const nextState = buildNextState({
    schedule,
    unscheduled,
    cancelled: currentState.cancelled || [],
    dataset,
  });

  const diff = buildDiff({
    event,

    beforeSchedule,

    afterSchedule: schedule,

    directlyAffected,

    cancelled: [],

    newlyUnscheduled,

    backfilled: [],
  });

  attachChurn(diff, directlyAffected.length);

  return {
    state: nextState,

    diff,
  };
}

function buildNextState({ schedule, unscheduled, cancelled, dataset }) {
  const metrics = computeMetrics({
    schedule,
    unscheduled,

    rooms: dataset.rooms,

    config: {
      totalDays: 4,

      dayStartTime: "09:00",

      dayEndTime: "19:00",

      minimumStudentBufferMinutes: 10,
    },
  });

  return {
    schedule,
    unscheduled,
    cancelled,
    metrics,
  };
}

export function buildDiff({
  event,
  beforeSchedule,
  afterSchedule,
  directlyAffected,
  cancelled,
  newlyUnscheduled,
  backfilled,
}) {
  const beforeById = new Map(beforeSchedule.map((item) => [item.id, item]));

  const afterById = new Map(afterSchedule.map((item) => [item.id, item]));

  const changed = [];

  for (const interview of directlyAffected) {
    const before = beforeById.get(interview.id);

    const after = afterById.get(interview.id);

    if (!before || !after) {
      continue;
    }

    if (assignmentChanged(before, after)) {
      changed.push({
        interviewId: interview.id,

        before: assignmentShape(before),

        after: assignmentShape(after),
      });
    }
  }

  const notify = buildNotifications({
    event,
    changed,
    cancelled,
    newlyUnscheduled,
    beforeById,
    afterById,
  });

  return {
    disruption: normalizeDisruption(event),

    changed,

    cancelled: cancelled.map((item) => item.id),

    newlyUnscheduled: newlyUnscheduled.map((item) => ({
      interviewId: item.id,

      studentId: item.studentId,

      companyId: item.companyId,

      reason: item.reason,
    })),

    backfilled: backfilled.map((item) => ({
      interviewId: item.id,

      studentId: item.studentId,

      companyId: item.companyId,

      after: assignmentShape(item),
    })),

    affected: directlyAffected.map((item) => item.id),

    notify,

    metrics: {
      churn: 0,
      percentAffected: "0%",
    },
  };
}

function assignmentChanged(before, after) {
  return (
    before.day !== after.day ||
    before.startMinute !== after.startMinute ||
    before.roomId !== after.roomId ||
    before.panelId !== after.panelId
  );
}

function assignmentShape(interview) {
  return {
    day: interview.day,

    time: interview.startTime,

    startMinute: interview.startMinute,

    room: interview.roomId,

    panel: interview.panelId,
  };
}

function attachChurn(diff, affectedCount) {
  const moved = diff.changed.length;

  const churn = computeReplanChurn({
    moved,
    affected: affectedCount,
  });

  diff.metrics = {
    churn: churn.moved,

    percentAffected: `${churn.rate}%`,
  };
}

function buildNotifications({
  event,
  changed,
  cancelled,
  newlyUnscheduled,
  beforeById,
  afterById,
}) {
  const notifications = [];

  const seen = new Set();

  function add(key, notification) {
    if (seen.has(key)) {
      return;
    }

    seen.add(key);

    notifications.push(notification);
  }

  for (const change of changed) {
    const interview = afterById.get(change.interviewId);

    if (!interview) {
      continue;
    }

    add(
      `student:${interview.studentId}:${change.interviewId}`,

      {
        studentId: interview.studentId,

        message: `Interview with ${interview.companyId} moved to day ${change.after.day} at ${change.after.time}.`,
      },
    );

    add(
      `company:${interview.companyId}:${change.interviewId}`,

      {
        companyId: interview.companyId,

        message: `Interview ${change.interviewId} was rescheduled to ${change.after.time}.`,
      },
    );
  }

  for (const interview of cancelled) {
    add(
      `company-cancel:${interview.companyId}:${interview.id}`,

      {
        companyId: interview.companyId,

        message: `${interview.studentId} withdrew; interview ${interview.id} was cancelled.`,
      },
    );
  }

  for (const interview of newlyUnscheduled) {
    add(
      `student-unscheduled:${interview.studentId}:${interview.id}`,

      {
        studentId: interview.studentId,

        message: `Interview with ${interview.companyId} could not be rescheduled: ${interview.reason}.`,
      },
    );

    add(
      `company-unscheduled:${interview.companyId}:${interview.id}`,

      {
        companyId: interview.companyId,

        message: `Interview ${interview.id} could not be rescheduled: ${interview.reason}.`,
      },
    );
  }

  return notifications;
}

function normalizeDisruption(event) {
  switch (event.type) {
    case DISRUPTION_TYPES.COMPANY_LATE:
      return {
        type: event.type,

        target: event.companyId,

        params: {
          hours: event.hours,
        },
      };

    case DISRUPTION_TYPES.PANEL_DROP:
      return {
        type: event.type,

        target: event.panelId,

        params: {},
      };

    case DISRUPTION_TYPES.STUDENT_WITHDRAW:
      return {
        type: event.type,

        target: event.studentId,

        params: {},
      };

    case DISRUPTION_TYPES.ROOM_UNAVAILABLE:
      return {
        type: event.type,

        target: event.roomId,

        params: {
          day: event.day,

          startMinute: event.startMinute,

          endMinute: event.endMinute,
        },
      };

    default:
      return {
        type: event.type,

        target: null,

        params: {},
      };
  }
}
