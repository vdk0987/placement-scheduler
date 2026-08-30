export const SCHEDULING_CONFIG = {
  DAYS: [1, 2, 3, 4],

  DAY_START_MINUTES: 9 * 60,
  DAY_END_MINUTES: 19 * 60,

  TICK_MINUTES: 5,

  INTERVIEW_STATUS: {
    SCHEDULED: "scheduled",
    UNSCHEDULED: "unscheduled",
    WITHDRAWN: "withdrawn",
    CANCELLED: "cancelled",
  },
};

export const REPLAN_CONFIG = {
    MAX_REPAIR_STEPS: 50,

    NEARBY_SLOT_RADIUS: 12,

    STUDENT_BUFFER_MINUTES: 10,
}
