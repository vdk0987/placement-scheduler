const parsePort = (value, fallback) => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : fallback;
};

export const env = {
  PORT: parsePort(process.env.PORT, 3000),

  CORS_ORIGIN:
    process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
