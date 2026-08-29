export const CONSTRAINT_POLICY = {
  hard: [
    {
      id: "student-double-booking",
      description:
        "A student cannot be assigned to overlapping interviews.",
    },
    {
      id: "room-double-booking",
      description:
        "A room cannot host overlapping interviews.",
    },
    {
      id: "panel-double-booking",
      description:
        "A panel cannot conduct overlapping interviews.",
    },
    {
      id: "cgpa-cutoff",
      description:
        "A student must satisfy the company's minimum CGPA cutoff.",
    },
  ],

  soft: [
    {
      id: "preferred-time-of-day",
      description:
        "Preferred interview times should be honored where possible.",
      bendPriority: 1,
    },
    {
      id: "panel-load-balancing",
      description:
        "Work should be distributed reasonably across available panels.",
      bendPriority: 2,
    },
    {
      id: "student-buffer-time",
      description:
        "Students should ideally have buffer time between consecutive interviews.",
      bendPriority: 3,
    },
  ],
};
