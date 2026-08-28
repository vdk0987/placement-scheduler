export default function enforceTopStudentOverlap(
  rng,
  companies,
  students
) {
  const sortedStudents = [...students].sort(
    (a, b) => b.cgpa - a.cgpa
  );

  const topStudentCount = Math.ceil(
    students.length * 0.05
  );

  const topStudents = sortedStudents.slice(
    0,
    topStudentCount
  );

  for (const student of topStudents) {
    const targetCount = randomInt(rng, 8, 12);

    const alreadyShortlisted =
      new Set(student.shortlistedBy);

    const possibleCompanies = companies.filter(
      (company) =>
        isEligible(student, company) &&
        !alreadyShortlisted.has(company.id)
    );

    const needed =
      targetCount - alreadyShortlisted.size;

    if (needed <= 0) {
      continue;
    }

    const selectedCompanies = sample(
      rng,
      possibleCompanies,
      needed
    );

    for (const company of selectedCompanies) {
      student.shortlistedBy.push(company.id);

      company.shortlistedStudentIds.push(student.id);
    }
  }
}
