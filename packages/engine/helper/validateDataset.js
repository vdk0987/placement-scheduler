import { CONFIG } from "../recruiterData.js";

export function validateDataset(dataset) {
  const {
    companies,
    students,
    rooms,
  } = dataset;

  if (companies.length !== CONFIG.TOTAL_COMPANIES) {
    throw new Error(
      `Expected ${CONFIG.TOTAL_COMPANIES} companies, got ${companies.length}`
    );
  }

  if (students.length !== CONFIG.TOTAL_STUDENTS) {
    throw new Error(
      `Expected ${CONFIG.TOTAL_STUDENTS} students, got ${students.length}`
    );
  }

  if (rooms.length !== CONFIG.TOTAL_ROOMS) {
    throw new Error(
      `Expected ${CONFIG.TOTAL_ROOMS} rooms, got ${rooms.length}`
    );
  }

  const companyIds = new Set(
    companies.map((company) => company.id)
  );

  for (const student of students) {
    for (const companyId of student.shortlistedBy) {
      if (!companyIds.has(companyId)) {
        throw new Error(
          `Student ${student.id} references unknown company ${companyId}`
        );
      }
    }
  }

  return true;
}

export function generateSummary(dataset) {
  const {
    companies,
    students,
    rooms,
  } = dataset;

  const massRecruiters = companies.filter(
    (company) =>
      company.type ===
      CONFIG.COMPANY_TYPES.MASS_RECRUITER
  );

  const midTierCompanies = companies.filter(
    (company) =>
      company.type ===
      CONFIG.COMPANY_TYPES.MID_TIER
  );

  const highTierCompanies = companies.filter(
    (company) =>
      company.type ===
      CONFIG.COMPANY_TYPES.HIGH_TIER
  );

  const topStudents = [...students]
    .sort((a, b) => b.cgpa - a.cgpa)
    .slice(0, Math.ceil(students.length * 0.05));

  const averageCGPA =
    students.reduce(
      (sum, student) => sum + student.cgpa,
      0
    ) / students.length;

  const averageShortlists =
    students.reduce(
      (sum, student) =>
        sum + student.shortlistedBy.length,
      0
    ) / students.length;

  return {
    companies: {
      total: companies.length,
      massRecruiters: massRecruiters.length,
      midTier: midTierCompanies.length,
      highTier: highTierCompanies.length,
    },

    students: {
      total: students.length,

      averageCGPA: Number(
        averageCGPA.toFixed(2)
      ),

      averageShortlistsPerStudent: Number(
        averageShortlists.toFixed(2)
      ),
    },

    top5Percent: {
      studentCount: topStudents.length,

      averageShortlists: Number(
        (
          topStudents.reduce(
            (sum, student) =>
              sum +
              student.shortlistedBy.length,
            0
          ) / topStudents.length
        ).toFixed(2)
      ),

      maxShortlists: Math.max(
        ...topStudents.map(
          (student) =>
            student.shortlistedBy.length
        )
      ),
    },

    rooms: {
      total: rooms.length,

      specialRooms: rooms.filter(
        (room) => room.features.length > 0
      ).length,
    },
  };
}
