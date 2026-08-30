export function checkStudentEligibility(request, student, company) {
  if (!student) {
    return {
      valid: false,
      reason: "student not found",
    };
  }

  if (!company) {
    return {
      valid: false,
      reason: "company not found",
    };
  }

  if (student.cgpa < company.cgpaCutoff) {
    return {
      valid: false,
      reason: "cgpa below cutoff",
    };
  }

  const branchRestrictions = Array.isArray(company.branchRestrictions)
    ? company.branchRestrictions
    : [];

  if (
    branchRestrictions.length > 0 &&
    !branchRestrictions.includes(student.branch)
  ) {
    return {
      valid: false,
      reason: "branch restriction",
    };
  }

  return {
    valid: true,
    reason: null,
  };
}

export function isResourceFree(occupancy, resourceId, day, startSlotIndex, ticks) {
  const busySlots = occupancy.get(resourceId);

  if (!busySlots) {
    return true;
  }

  for (let offset = 0; offset < ticks; offset++) {
    const key = `${day}:${startSlotIndex + offset}`;

    if (busySlots.has(key)) {
      return false;
    }
  }

  return true;
}

export function isRoomFree(state, roomId, day, startSlotIndex, ticks) {
  return isResourceFree(
    state.roomOccupancy,
    roomId,
    day,
    startSlotIndex,
    ticks,
  );
}

export function isPanelFree(state, panelId, day, startSlotIndex, ticks) {
  return isResourceFree(
    state.panelOccupancy,
    panelId,
    day,
    startSlotIndex,
    ticks,
  );
}

export function isStudentFree(state, studentId, day, startSlotIndex, ticks) {
  return isResourceFree(
    state.studentOccupancy,
    studentId,
    day,
    startSlotIndex,
    ticks,
  );
}

export function checkFeasibility(
  { request, student, company, room, panel, day, startSlotIndex, ticks },
  state,
) {
  const eligibility = checkStudentEligibility(request, student, company);

  if (!eligibility.valid) {
    return eligibility;
  }

  if (panel.companyId !== company.id) {
    return {
      valid: false,
      reason: "panel does not belong to company",
    };
  }

  if (!isPanelFree(state, panel.id, day, startSlotIndex, ticks)) {
    return {
      valid: false,
      reason: "panel unavailable",
    };
  }

  if (!isRoomFree(state, room.id, day, startSlotIndex, ticks)) {
    return {
      valid: false,
      reason: "room unavailable",
    };
  }

  if (!isStudentFree(state, student.id, day, startSlotIndex, ticks)) {
    return {
      valid: false,
      reason: "student clash",
    };
  }

  return {
    valid: true,
    reason: null,
  };
}
