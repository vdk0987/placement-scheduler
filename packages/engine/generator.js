import fs from "fs";
import path from "path";

import { mulberry32 } from "mulberry.js";

const CONFIG = {
  TOTAL_COMPANIES: 35,
  TOTAL_STUDENTS: 800,
  TOTAL_ROOMS: 20,
  TOTAL_DAYS: 4,

  BRANCHES: [
    "CSE",
    "ISE",
    "ECE",
    "EEE",
    "ME",
    "CE",
  ],

  COMPANY_TYPES: {
    MASS_RECRUITER: "mass_recruiter",
    MID_TIER: "mid_tier",
    HIGH_TIER: "high_tier",
  },
};

function generateCGPA(rng) {
  const a = rng();
  const b = rng();
  const c = rng();

  const normalized = (a + b + c) / 3;

  let cgpa = 5.5 + normalized * 4.5;

  cgpa = Math.max(5.0, Math.min(10.0, cgpa));

  return Number(cgpa.toFixed(2));
}