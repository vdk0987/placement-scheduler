function timeToMinutes(time) {
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

function getInterviewEndMinutes(interview) {
  return timeToMinutes(interview.startTime) + getInterviewDuration(interview);
}

export function intervalsOverlap(a, b) {
  const aStart = timeToMinutes(a.startTime);
  const aEnd = getInterviewEndMinutes(a);

  const bStart = timeToMinutes(b.startTime);
  const bEnd = getInterviewEndMinutes(b);

  return aStart < bEnd && bStart < aEnd;
}
