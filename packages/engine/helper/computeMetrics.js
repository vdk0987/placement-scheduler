import { timeToMinutes, getInterviewEndMinutes, groupBy, round } from "./metricsHelper.js";

export function computeSchedulingMetrics(schedule, unscheduled) {
  const total = schedule.length + unscheduled.length;

  const percentScheduled = total === 0 ? 0 : (schedule.length / total) * 100;

  return {
    totalRequests: total,
    scheduled: schedule.length,
    unscheduled: unscheduled.length,
    percentScheduled: round(percentScheduled, 2),
  };
}

export function computeRoomUtilization({ schedule, rooms, config }) {
  const startTime = config.dayStartTime || "09:00";

  const endTime = config.dayEndTime || "17:00";

  const availableMinutesPerRoom =
    timeToMinutes(endTime) - timeToMinutes(startTime);

  const totalAvailableMinutesPerRoomDay = availableMinutesPerRoom;

  const byDay = {};

  // Find all days represented in schedule.
  const days = new Set(schedule.map((item) => item.day));

  // Include configured days even if empty.
  const totalDays = config.totalDays || 4;

  for (let day = 1; day <= totalDays; day++) {
    days.add(day);
  }

  for (const day of [...days].sort((a, b) => a - b)) {
    const dayInterviews = schedule.filter((item) => item.day === day);

    const bookedMinutes = dayInterviews.reduce(
      (total, interview) => total + interview.durationMinutes,
      0,
    );

    const totalAvailableMinutes =
      rooms.length * totalAvailableMinutesPerRoomDay;

    const utilizationPercent =
      totalAvailableMinutes === 0
        ? 0
        : (bookedMinutes / totalAvailableMinutes) * 100;

    byDay[day] = {
      bookedMinutes,
      availableMinutes: totalAvailableMinutes,
      utilizationPercent: round(utilizationPercent, 2),
    };
  }

  const totalBookedMinutes = Object.values(byDay).reduce(
    (total, day) => total + day.bookedMinutes,
    0,
  );

  const totalAvailableMinutes = Object.values(byDay).reduce(
    (total, day) => total + day.availableMinutes,
    0,
  );

  return {
    window: {
      startTime,
      endTime,
      minutesPerRoom: availableMinutesPerRoom,
    },

    overall: {
      bookedMinutes: totalBookedMinutes,

      availableMinutes: totalAvailableMinutes,

      utilizationPercent: round(
        totalAvailableMinutes === 0
          ? 0
          : (totalBookedMinutes / totalAvailableMinutes) * 100,
        2,
      ),
    },

    byDay,
  };
}

export function computeStudentWaitTime(schedule) {
  const studentDayGroups = groupBy(schedule, (interview) => {
    return `${interview.studentId}:${interview.day}`;
  });

  let totalWaitMinutes = 0;

  let gapCount = 0;

  const studentsWithMultipleInterviews = new Set();

  const byStudent = [];

  for (const [key, interviews] of studentDayGroups.entries()) {
    if (interviews.length < 2) {
      continue;
    }

    const sorted = [...interviews].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
    );

    const [studentId, dayString] = key.split(":");

    const day = Number(dayString);

    studentsWithMultipleInterviews.add(studentId);

    let studentWaitMinutes = 0;

    const gaps = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];

      const next = sorted[i + 1];

      const currentEnd = getInterviewEndMinutes(current);

      const nextStart = timeToMinutes(next.startTime);

      const gap = Math.max(0, nextStart - currentEnd);

      studentWaitMinutes += gap;
      totalWaitMinutes += gap;
      gapCount++;

      gaps.push({
        afterInterviewId: current.id,

        beforeInterviewId: next.id,

        waitMinutes: gap,
      });
    }

    byStudent.push({
      studentId,
      day,

      interviewCount: sorted.length,

      totalWaitMinutes: studentWaitMinutes,

      averageWaitMinutes: round(
        studentWaitMinutes / Math.max(sorted.length - 1, 1),
        2,
      ),

      gaps,
    });
  }

  return {
    studentsWithMultipleInterviews: studentsWithMultipleInterviews.size,

    totalWaitMinutes,

    totalGaps: gapCount,

    averageWaitMinutes: round(
      gapCount === 0 ? 0 : totalWaitMinutes / gapCount,
      2,
    ),

    byStudent,
  };
}

export function computeNearMisses({ schedule, config }) {
  const minimumStudentBufferMinutes = config.minimumStudentBufferMinutes ?? 10;

  const preferredStartTime = config.preferredStartTime || "09:00";

  const preferredEndTime = config.preferredEndTime || "17:00";

  const nearMisses = [];

  const studentDayGroups = groupBy(schedule, (interview) => {
    return `${interview.studentId}:${interview.day}`;
  });

  for (const interviews of studentDayGroups.values()) {
    if (interviews.length < 2) {
      continue;
    }

    const sorted = [...interviews].sort(
      (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];

      const next = sorted[i + 1];

      const currentEnd = getInterviewEndMinutes(current);

      const nextStart = timeToMinutes(next.startTime);

      const actualGap = Math.max(0, nextStart - currentEnd);

      if (actualGap < minimumStudentBufferMinutes) {
        nearMisses.push({
          type: "student-buffer-time",
          severity: "soft",
          studentId: current.studentId,
          day: current.day,
          actualGapMinutes: actualGap,
          requiredGapMinutes: minimumStudentBufferMinutes,
          interviews: [current.id, next.id],
        });
      }
    }
  }

  const preferredStartMinutes = timeToMinutes(preferredStartTime);

  const preferredEndMinutes = timeToMinutes(preferredEndTime);

  for (const interview of schedule) {
    const startMinutes = timeToMinutes(interview.startTime);

    const endMinutes = getInterviewEndMinutes(interview);

    if (
      startMinutes < preferredStartMinutes ||
      endMinutes > preferredEndMinutes
    ) {
      nearMisses.push({
        type: "preferred-time-of-day",
        severity: "soft",
        interviewId: interview.id,
        companyId: interview.companyId,
        studentId: interview.studentId,
        day: interview.day,
        startTime: interview.startTime,
      });
    }
  }

  return {
    count: nearMisses.length,
    items: nearMisses,
  };
}
