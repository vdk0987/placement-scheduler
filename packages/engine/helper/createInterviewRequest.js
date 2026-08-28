import { buildIndexes } from "./buildIndexes.js";

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
