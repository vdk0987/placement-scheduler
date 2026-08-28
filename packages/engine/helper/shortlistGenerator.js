import { weightedPick } from "./helpers.js";

function buildStudentPercentiles(students) {
  const sorted = [...students].sort(
    (a, b) => b.cgpa - a.cgpa
  );

  const percentileById = new Map();

  sorted.forEach((student, index) => {
    const percentile =
      1 - index / (sorted.length - 1);

    percentileById.set(student.id, percentile);
  });

  return percentileById;
}

export function isEligible(student, company) {
  if (student.cgpa < company.cgpaCutoff) {
    return false;
  }

  if (
    company.branchRestrictions.length > 0 &&
    !company.branchRestrictions.includes(student.branch)
  ) {
    return false;
  }

  return true;
}

function calculateShortlistWeight(
  student,
  company,
  percentile
) {
  let weight = 1;

  weight += percentile * 8;

  if (percentile >= 0.95) {
    weight *= 5;
  }

  else if (percentile >= 0.90) {
    weight *= 3;
  }

  const cgpaMargin =
    student.cgpa - company.cgpaCutoff;

  weight += Math.max(0, cgpaMargin) * 3;

  weight *= company.popularity;

  return Math.max(weight, 0.01);
}

function weightedSampleStudents(
  rng,
  candidates,
  count,
  company,
  percentileById
) {
  const available = [...candidates];

  const selected = [];

  while (
    selected.length < count &&
    available.length > 0
  ) {
    const weightedCandidates = available.map(
      (student) => ({
        value: student,
        weight: calculateShortlistWeight(
          student,
          company,
          percentileById.get(student.id)
        ),
      })
    );

    const chosen = weightedPick(
      rng,
      weightedCandidates
    );

    selected.push(chosen);

    const index = available.findIndex(
      (student) => student.id === chosen.id
    );

    available.splice(index, 1);
  }

  return selected;
}

export function generateShortlists(rng, companies, students) {
  const percentileById =
    buildStudentPercentiles(students);

  for (const company of companies) {
    const eligibleStudents = students.filter(
      (student) => isEligible(student, company)
    );

    const actualShortlistSize = Math.min(
      company.shortlistTargetSize,
      eligibleStudents.length
    );

    const selectedStudents =
      weightedSampleStudents(
        rng,
        eligibleStudents,
        actualShortlistSize,
        company,
        percentileById
      );

    for (const student of selectedStudents) {
      student.shortlistedBy.push(company.id);
    }

    company.shortlistedStudentIds =
      selectedStudents.map((student) => student.id);
  }

  return {
    companies,
    students,
  };
}
