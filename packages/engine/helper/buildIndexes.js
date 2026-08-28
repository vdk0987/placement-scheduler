export function buildIndexes(dataset) {
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
