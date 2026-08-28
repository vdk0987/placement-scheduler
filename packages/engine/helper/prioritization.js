export function prioritize(requests) {
  return [...requests].sort((a, b) => {
    // Day first.
    if (a.day !== b.day) {
      return a.day - b.day;
    }

    // Higher priority first.
    if (a.companyPriorityTier !== b.companyPriorityTier) {
      return b.companyPriorityTier - a.companyPriorityTier;
    }

    // More overlapping shortlists first.
    if (a.studentShortlistOverlapCount !== b.studentShortlistOverlapCount) {
      return b.studentShortlistOverlapCount - a.studentShortlistOverlapCount;
    }

    // Higher CGPA first.
    if (a.studentCGPA !== b.studentCGPA) {
      return b.studentCGPA - a.studentCGPA;
    }

    // Stable deterministic tie-breaker.
    return a.id.localeCompare(b.id);
  });
}
