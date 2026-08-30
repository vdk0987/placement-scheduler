import { SCHEDULING_CONFIG, REPLAN_CONFIG } from "./types.js";
import { durationToTicks } from "./timeGrid.js";
import { checkFeasibility } from "./constraints.js";

export function createEmptyOccupancyState() {
  return {
    roomOccupancy: new Map(),
    panelOccupancy: new Map(),
    studentOccupancy: new Map(),
  };
}

function markBusy(occupancy, resourceId, day, startSlotIndex, ticks) {
  if (!occupancy.has(resourceId)) {
    occupancy.set(resourceId, new Set());
  }

  const busy = occupancy.get(resourceId);

  for (let i = 0; i < ticks; i++) {
    busy.add(`${day}:${startSlotIndex + i}`);
  }
}

export function occupyInterview(state, interview) {
  if (interview.status !== SCHEDULING_CONFIG.INTERVIEW_STATUS.SCHEDULED) {
    return;
  }

  markBusy(
    state.roomOccupancy,
    interview.roomId,
    interview.day,
    interview.startSlotIndex,
    interview.ticks,
  );

  markBusy(
    state.panelOccupancy,
    interview.panelId,
    interview.day,
    interview.startSlotIndex,
    interview.ticks,
  );

  markBusy(
    state.studentOccupancy,
    interview.studentId,
    interview.day,
    interview.startSlotIndex,
    interview.ticks,
  );
}

export function buildOccupancyState(
  schedule,
  excludedInterviewIds = new Set(),
) {
  const state = createEmptyOccupancyState();

  for (const interview of schedule) {
    if (excludedInterviewIds.has(interview.id)) {
      continue;
    }

    occupyInterview(state, interview);
  }

  return state;
}

function earliestAllowedMinute(interview, event) {
  if (event.type !== "companyLate") {
    return null;
  }

  return interview.startMinute + event.hours * 60;
}

export function generateCandidateAssignments({
  interview,
  company,
  rooms,
  timeGrid,
  event,
}) {
  const candidates = [];

  const minimumStart = earliestAllowedMinute(interview, event);

  const day = event?.type === "companyLate" ? interview.day : interview.day;

  const slots = timeGrid[day];

  if (!slots) {
    return candidates;
  }

  const originalSlot = interview.startSlotIndex;

  const slotIndexes = nearbySlotOrder(originalSlot, slots.length);

  for (const slotIndex of slotIndexes) {
    const startSlot = slots[slotIndex];

    if (!startSlot) {
      continue;
    }

    if (minimumStart !== null && startSlot.startMinute < minimumStart) {
      continue;
    }

    const ticks = durationToTicks(interview.durationMinutes);

    if (slotIndex + ticks > slots.length) {
      continue;
    }

    const candidateRooms =
      event?.type === "roomUnavailable"
        ? rooms.filter((room) => room.id !== event.roomId)
        : rooms;

    const candidatePanels =
      event?.type === "panelDrop"
        ? company.panels.filter((panel) => panel.id !== event.panelId)
        : company.panels;

    for (const room of candidateRooms) {
      for (const panel of candidatePanels) {
        candidates.push({
          day,

          startSlotIndex: slotIndex,

          startMinute: startSlot.startMinute,

          endMinute:
            startSlot.startMinute + ticks * SCHEDULING_CONFIG.TICK_MINUTES,

          startTime: startSlot.startTime,

          roomId: room.id,

          panelId: panel.id,

          ticks,
        });
      }
    }
  }

  return candidates;
}

function nearbySlotOrder(original, totalSlots) {
  const result = [];

  const maxRadius = Math.max(REPLAN_CONFIG.NEARBY_SLOT_RADIUS, totalSlots);

  for (let distance = 0; distance <= maxRadius; distance++) {
    const forward = original + distance;

    const backward = original - distance;

    if (forward >= 0 && forward < totalSlots && !result.includes(forward)) {
      result.push(forward);
    }

    if (backward >= 0 && backward < totalSlots && !result.includes(backward)) {
      result.push(backward);
    }
  }

  return result;
}

export function scoreCandidate({ interview, candidate, context }) {
  const { state, company, student, room, panel, schedule } = context;

  const feasibility = checkFeasibility(
    {
      request: {
        companyId: interview.companyId,

        studentId: interview.studentId,

        slotDuration: interview.durationMinutes,
      },

      company,
      student,
      room,
      panel,

      day: candidate.day,

      startSlotIndex: candidate.startSlotIndex,

      ticks: candidate.ticks,
    },
    state,
  );

  if (!feasibility.valid) {
    return {
      feasible: false,
      score: Infinity,
      reason: feasibility.reason,
    };
  }

  let score = 0;

  score += Math.abs(candidate.startSlotIndex - interview.startSlotIndex) * 4;

  if (candidate.roomId !== interview.roomId) {
    score += 2;
  }

  if (candidate.panelId !== interview.panelId) {
    score += 3;
  }

  score += studentBufferPenalty(interview, candidate, schedule);

  return {
    feasible: true,
    score,
    reason: null,
  };
}

function studentBufferPenalty(interview, candidate, schedule) {
  const others = schedule.filter(
    (other) =>
      other.id !== interview.id &&
      other.studentId === interview.studentId &&
      other.day === candidate.day &&
      other.status === SCHEDULING_CONFIG.INTERVIEW_STATUS.SCHEDULED,
  );

  let penalty = 0;

  for (const other of others) {
    const gapBefore = candidate.startMinute - other.endMinute;

    const gapAfter = other.startMinute - candidate.endMinute;

    if (gapBefore >= 0 && gapBefore < REPLAN_CONFIG.STUDENT_BUFFER_MINUTES) {
      penalty += REPLAN_CONFIG.STUDENT_BUFFER_MINUTES - gapBefore;
    }

    if (gapAfter >= 0 && gapAfter < REPLAN_CONFIG.STUDENT_BUFFER_MINUTES) {
      penalty += REPLAN_CONFIG.STUDENT_BUFFER_MINUTES - gapAfter;
    }
  }

  return penalty;
}

export function findBestRepairCandidate({
  interview,
  company,
  student,
  rooms,
  timeGrid,
  state,
  schedule,
  event,
}) {
  const candidates = generateCandidateAssignments({
    interview,
    company,
    rooms,
    timeGrid,
    event,
  });

  let best = null;

  const MAX_DELAY_MINUTES = 180;

  for (const candidate of candidates) {
    const delayMinutes = candidate.startMinute - interview.startMinute;

    if (delayMinutes > MAX_DELAY_MINUTES) {
      continue;
    }

    const room = rooms.find((item) => item.id === candidate.roomId);

    const panel = company.panels.find((item) => item.id === candidate.panelId);

    const feasibility = checkFeasibility(
      {
        request: {
          companyId: interview.companyId,
          studentId: interview.studentId,
          slotDuration: interview.durationMinutes,
        },
        company,
        student,
        room,
        panel,
        day: candidate.day,
        startSlotIndex: candidate.startSlotIndex,
        ticks: candidate.ticks,
      },
      state,
    );

    if (!feasibility.valid) {
      continue;
    }


    const result = scoreCandidate({
      interview,
      candidate,

      context: {
        state,
        company,
        student,
        room,
        panel,
        schedule,
      },
    });

    if (!result.feasible) {
      continue;
    }

    if (!best || result.score < best.score) {
      best = {
        candidate,
        score: result.score,
      };
    }
  }

  return best;
}

export function minConflictsRepair({
  interviews,
  schedule,
  dataset,
  timeGrid,
  event,
}) {
  const repaired = [];

  const stillUnscheduled = [];

  const repairIds = new Set(interviews.map((item) => item.id));

  const state = buildOccupancyState(schedule, repairIds);

  const companiesById = new Map(
    dataset.companies.map((company) => [company.id, company]),
  );

  const studentsById = new Map(
    dataset.students.map((student) => [student.id, student]),
  );

  let steps = 0;

  const ordered = [...interviews].sort(
    (a, b) =>
      b.studentShortlistOverlapCount - a.studentShortlistOverlapCount ||
      a.startMinute - b.startMinute,
  );

  for (const interview of ordered) {
    if (steps >= REPLAN_CONFIG.MAX_REPAIR_STEPS) {
      stillUnscheduled.push({
        ...interview,

        reason: "repair iteration limit reached",
      });

      continue;
    }

    const company = companiesById.get(interview.companyId);

    const student = studentsById.get(interview.studentId);

    const best = findBestRepairCandidate({
      interview,

      company,
      student,

      rooms: dataset.rooms,

      timeGrid,
      state,

      schedule: [
        ...schedule.filter((item) => !repairIds.has(item.id)),
        ...repaired,
      ],

      event,
    });

    if (!best) {
      stillUnscheduled.push({
        ...interview,

        reason: failureReason(event),
      });

      steps++;

      continue;
    }

    const updated = {
      ...interview,

      ...best.candidate,

      status: SCHEDULING_CONFIG.INTERVIEW_STATUS.SCHEDULED,
    };

    repaired.push(updated);

    occupyInterview(state, updated);

    steps++;
  }

  return {
    repaired,
    stillUnscheduled,
    steps,
  };
}

function failureReason(event) {
  switch (event.type) {
    case "panelDrop":
      return "panel dropped, no alternate panel capacity";

    case "roomUnavailable":
      return "room unavailable, no alternate room capacity";

    case "companyLate":
      return "company delay caused no feasible replacement slot";

    default:
      return "no feasible repair found";
  }
}
