import { SCHEDULING_CONFIG } from '../types.js';

function markResourceBusy(occupancy, resourceId, day, startSlotIndex, ticks) {
  if (!occupancy.has(resourceId)) {
    occupancy.set(resourceId, new Set());
  }

  const busySlots = occupancy.get(resourceId);

  for (let offset = 0; offset < ticks; offset++) {
    busySlots.add(`${day}:${startSlotIndex + offset}`);
  }
}

export function commitAssignment(request, slot, state) {
  markResourceBusy(
    state.roomOccupancy,
    slot.roomId,
    slot.day,
    slot.startSlotIndex,
    slot.ticks,
  );

  markResourceBusy(
    state.panelOccupancy,
    slot.panelId,
    slot.day,
    slot.startSlotIndex,
    slot.ticks,
  );

  markResourceBusy(
    state.studentOccupancy,
    request.studentId,
    slot.day,
    slot.startSlotIndex,
    slot.ticks,
  );

  return {
    id: `interview-${request.companyId}-${request.studentId}`,
    companyId: request.companyId,
    studentId: request.studentId,
    panelId: slot.panelId,
    roomId: slot.roomId,
    day: slot.day,
    startTime: slot.startTime,
    startMinute: slot.startMinute,
    endMinute: slot.endMinute,
    slotDuration: request.slotDuration,
    durationMinutes: request.slotDuration,
    startSlotIndex: slot.startSlotIndex,
    ticks: slot.ticks,
    status: SCHEDULING_CONFIG.INTERVIEW_STATUS.SCHEDULED,
  };
}
