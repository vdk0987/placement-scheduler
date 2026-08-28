function buildIndexes(dataset) {
  const companiesById = new Map(
    dataset.companies.map((company) => [company.id, company]),
  );

  const studentsById = new Map(
    dataset.students.map((student) => [student.id, student]),
  );

  const panelsById = new Map();

  for (const company of dataset.companies) {
    for (const panel of company.panels) {
      panelsById.set(panel.id, panel);
    }
  }

  const roomsById = new Map(dataset.rooms.map((room) => [room.id, room]));

  return {
    companiesById,
    studentsById,
    panelsById,
    roomsById,
  };
}

export function createInterviewRequests(dataset) {
  const requests = [];

  const { companiesById, studentsById } = buildIndexes(dataset);

  for (const company of dataset.companies) {
    for (const studentId of company.shortlistedStudentIds) {
      const student = studentsById.get(studentId);

      if (!student) {
        continue;
      }

      requests.push({
        id: `interview-request-${company.id}-${student.id}`,

        companyId: company.id,

        studentId: student.id,

        day: company.day,

        companyPriorityTier: company.priorityTier,

        companyType: company.type,

        slotDuration: company.slotDuration,

        studentCGPA: student.cgpa,
        studentShortlistOverlapCount: student.shortlistedBy.length,
      });
    }
  }

  return requests;
}
