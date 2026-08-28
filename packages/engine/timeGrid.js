import SCHEDULING_CONFIG from "./types.js";

export function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function createDaySlots() {
  const slots = [];

  const { DAY_START_MINUTES, DAY_END_MINUTES, TICK_MINUTES } =
    SCHEDULING_CONFIG;

  for (
    let minute = DAY_START_MINUTES;
    minute < DAY_END_MINUTES;
    minute += TICK_MINUTES
  ) {
    slots.push({
      startMinute: minute,
      endMinute: minute + TICK_MINUTES,
      startTime: formatTime(minute),
      endTime: formatTime(minute + TICK_MINUTES),
    });
  }

  return slots;
}

export function createTimeGrid(days = SCHEDULING_CONFIG.DAYS) {
  const grid = {};

  for (const day of days) {
    grid[day] = createDaySlots();
  }

  return grid;
}

export function durationToTicks(durationMinutes) {
  const { TICK_MINUTES } = SCHEDULING_CONFIG;

  return Math.ceil(durationMinutes / TICK_MINUTES);
}

export function fitsWithinDay(daySlots, startSlotIndex, durationMinutes) {
  const ticks = durationToTicks(durationMinutes);

  return startSlotIndex + ticks <= daySlots.length;
}
