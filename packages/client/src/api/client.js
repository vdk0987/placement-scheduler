const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export function getSchedule(day) {
  const query = day ? `?day=${day}` : "";

  return request(`/api/schedule${query}`);
}

export function getUnscheduled() {
  return request("/api/unscheduled");
}

export function getMetrics() {
  return request("/api/metrics");
}

export function previewReplan(type, payload) {
  return request(`/api/replan/${type}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getPreview() {
  return request("/api/replan/preview");
}

export function commitPreview(previewId) {
  return request("/api/replan/commit", {
    method: "POST",
    body: JSON.stringify({
      previewId,
    }),
  });
}
