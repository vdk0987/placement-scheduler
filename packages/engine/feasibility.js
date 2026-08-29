import {
  intervalsOverlap,
  getInterviewEndMinutes,
  timeToMinutes,
} from "./helper/metricsHelper.js";

export function validateSchedule(schedule) {
  const clashes = [];
  const studentGroups = groupBy(schedule, (item) => {
    return `${item.day}:${item.studentId}`;
  });

  for (const [key, interviews] of studentGroups.entries()) {
    findOverlaps(
      interviews,
      "student",
      (a) => a.studentId === b.studentId,
      clashes,
    );
  }

  const roomGroups = groupBy(schedule, (item) => {
    return `${item.day}:${item.roomId}`;
  });

  for (const [key, interviews] of roomGroups.entries()) {
    findOverlaps(interviews, "room", (a) => a.roomId === b.roomId, clashes);
  }
  const panelGroups = groupBy(schedule, (item) => {
    return `${item.day}:${item.panelId}`;
  });

  for (const [key, interviews] of panelGroups.entries()) {
    findOverlaps(interviews, "panel", (a) => a.panelId === b.panelId, clashes);
  }

  return {
    isFeasible: clashes.length === 0,
    clashCount: clashes.length,
    clashes,
  };
}

function findOverlaps(interviews, resourceType, sameResource, clashes) {
  const sorted = [...interviews].sort((a, b) => {
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];

      if (timeToMinutes(b.startTime) >= getInterviewEndMinutes(a)) {
        break;
      }

      if (sameResource(a, b) && intervalsOverlap(a, b)) {
        clashes.push({
          type: `${resourceType}-double-booking`,
          resourceType,

          resourceId:
            resourceType === "student"
              ? a.studentId
              : resourceType === "room"
                ? a.roomId
                : a.panelId,

          day: a.day,

          interviews: [
            {
              id: a.id,
              companyId: a.companyId,
              studentId: a.studentId,
              startTime: a.startTime,
            },
            {
              id: b.id,
              companyId: b.companyId,
              studentId: b.studentId,
              startTime: b.startTime,
            },
          ],
        });
      }
    }
  }
}

function groupBy(items, getKey) {
  const groups = new Map();

  for (const item of items) {
    const key = getKey(item);

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(item);
  }

  return groups;
}
