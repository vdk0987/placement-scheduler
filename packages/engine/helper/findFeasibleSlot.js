export function findFeasibleSlot(request, context) {
  const { timeGrid, state, companiesById, studentsById, rooms } = context;

  const company = companiesById.get(request.companyId);

  const student = studentsById.get(request.studentId);

  if (!company || !student) {
    return null;
  }

  const daySlots = timeGrid[request.day];

  if (!daySlots) {
    return null;
  }

  const ticks = durationToTicks(request.slotDuration);

  for (let slotIndex = 0; slotIndex < daySlots.length; slotIndex++) {
    if (!fitsWithinDay(daySlots, slotIndex, request.slotDuration)) {
      continue;
    }
    for (const room of rooms) {
      for (const panel of company.panels) {
        const feasibility = checkFeasibility(
          {
            request,
            student,
            company,
            room,
            panel,
            day: request.day,
            startSlotIndex: slotIndex,
            ticks,
          },
          state,
        );

        if (feasibility.valid) {
          const startSlot = daySlots[slotIndex];

          const endMinute = startSlot.startMinute + request.slotDuration;

          return {
            day: request.day,
            startSlotIndex: slotIndex,
            startMinute: startSlot.startMinute,
            endMinute,
            startTime: startSlot.startTime,
            panelId: panel.id,
            roomId: room.id,
            ticks,
          };
        }
      }
    }
  }
  return null;
}
