export function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0",
  )}`;
}

export function getInterviewDuration(interview) {
  if (typeof interview.durationMinutes === "number") {
    return interview.durationMinutes;
  }

  throw new Error(`Interview ${interview.id} is missing durationMinutes`);
}

export function getInterviewEndMinutes(interview) {
  return timeToMinutes(interview.startTime) + getInterviewDuration(interview);
}

export function intervalsOverlap(a, b) {
  const aStart = timeToMinutes(a.startTime);
  const aEnd = getInterviewEndMinutes(a);

  const bStart = timeToMinutes(b.startTime);
  const bEnd = getInterviewEndMinutes(b);

  return aStart < bEnd && bStart < aEnd;
}

export function computeReplanChurn({ moved, affected }) {
  if (affected === 0) {
    return {
      moved: 0,
      affected: 0,
      rate: 0,
    };
  }

  return {
    moved,
    affected,

    rate: round((moved / affected) * 100, 2),
  };
}

export function groupBy(items, getKey) {
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

export function round(value, decimals = 2) {
  const multiplier = 10 ** decimals;

  return Math.round(value * multiplier) / multiplier;
}
