import { checkFeasibility, checkStudentEligibility } from "./constraints.js";
import { durationToTicks, fitsWithinDay } from "./timeGrid.js";

export function explainFailure(request, context) {
  const {
    timeGrid,
    state,

    companiesById,
    studentsById,

    rooms,
  } = context;

  const company = companiesById.get(request.companyId);

  const student = studentsById.get(request.studentId);

  if (!company) {
    return "company not found";
  }

  if (!student) {
    return "student not found";
  }
  const eligibility = checkStudentEligibility(request, student, company);

  if (!eligibility.valid) {
    return eligibility.reason;
  }

  const daySlots = timeGrid[request.day];

  if (!daySlots) {
    return "invalid scheduling day";
  }

  const ticks = durationToTicks(request.slotDuration);
  let sawStudentAvailable = false;

  let sawPanelAvailable = false;

  let sawRoomAvailable = false;

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

        if (feasibility.reason !== "student clash") {
          sawStudentAvailable = true;
        }

        if (feasibility.reason !== "panel unavailable") {
          sawPanelAvailable = true;
        }

        if (feasibility.reason !== "room unavailable") {
          sawRoomAvailable = true;
        }
      }
    }
  }

  if (!sawStudentAvailable) {
    return "no common free slot for student and panel";
  }

  if (!sawPanelAvailable) {
    return "panel unavailable for required duration";
  }

  if (!sawRoomAvailable) {
    return "room capacity exhausted for this window";
  }

  return "no common feasible slot";
}
