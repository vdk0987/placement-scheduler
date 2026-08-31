export function getInterviewStart(interview) {
  return (
    interview.startMinute ??
    timeToMinutes(interview.startTime ?? interview.start)
  );
}

export function getInterviewDuration(interview) {
  return interview.durationMinutes ?? interview.slotDuration ?? 15;
}

export function getInterviewEnd(interview) {
  return getInterviewStart(interview) + getInterviewDuration(interview);
}

export function timeToMinutes(value) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return 0;
  }

  const [hours, minutes] = value.split(":").map(Number);

  return hours * 60 + minutes;
}

export function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);

  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function generateTimeSlots(start = 540, end = 1140, tick = 30) {
  const slots = [];

  for (let minute = start; minute < end; minute += tick) {
    slots.push(minute);
  }

  return slots;
}
