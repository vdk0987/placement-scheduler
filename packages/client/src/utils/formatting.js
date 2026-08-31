export function formatPercent(value, digits = 1) {
  if (value === null || value === undefined) {
    return "—";
  }

  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return "—";
  }

  return `${numeric.toFixed(digits)}%`;
}

export function formatMinutes(minutes) {
  if (minutes === null || minutes === undefined) {
    return "—";
  }

  const hours = Math.floor(minutes / 60);

  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}
