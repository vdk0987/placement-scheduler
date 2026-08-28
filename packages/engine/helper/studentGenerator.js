import { CONFIG } from "../recruiterData.js";

export default function generateStudents(rng) {
  const students = [];

  for (let i = 0; i < CONFIG.TOTAL_STUDENTS; i++) {
    const id = `student-${String(i + 1).padStart(4, "0")}`;

    const cgpa = generateCGPA(rng);

    const branch = weightedPick(rng, [
      { value: "CSE", weight: 28 },
      { value: "ISE", weight: 16 },
      { value: "ECE", weight: 18 },
      { value: "EEE", weight: 10 },
      { value: "ME", weight: 16 },
      { value: "CE", weight: 12 },
    ]);

    students.push({
      id,
      name: `Student ${String(i + 1).padStart(4, "0")}`,
      cgpa,
      branch,
      shortlistedBy: [],
    });
  }

  return students;
}
