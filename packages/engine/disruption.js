export const DISRUPTION_TYPES = {
  COMPANY_LATE: "companyLate",
  PANEL_DROP: "panelDrop",
  STUDENT_WITHDRAW: "studentWithdraw",
  ROOM_UNAVAILABLE: "roomUnavailable",
};

export function findAffectedInterviews(event, schedule) {
  switch (event.type) {
    case DISRUPTION_TYPES.COMPANY_LATE:
      return schedule.filter(
        (interview) => interview.companyId === event.companyId,
      );

    case DISRUPTION_TYPES.PANEL_DROP:
      return schedule.filter(
        (interview) => interview.panelId === event.panelId,
      );

    case DISRUPTION_TYPES.STUDENT_WITHDRAW:
      return schedule.filter(
        (interview) => interview.studentId === event.studentId,
      );

    case DISRUPTION_TYPES.ROOM_UNAVAILABLE:
      return schedule.filter(
        (interview) =>
          interview.roomId === event.roomId &&
          interview.day === event.day &&
          intervalsOverlap(
            interview.startMinute,
            interview.endMinute,
            event.startMinute,
            event.endMinute,
          ),
      );

    default:
      throw new Error(`Unsupported disruption type: ${event.type}`);
  }
}

function intervalsOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}
