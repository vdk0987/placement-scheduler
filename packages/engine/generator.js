import fs from "fs";
import path from "path";

import { mulberry32 } from "mulberry.js";
import { CONFIG } from "./recruiterData.js";

import { companyGenerator } from "./helper/companyGenerator.js";
import { studentGenerator } from "./helper/studentGenerator.js";
import { generateShortlists } from "./helper/shortlistGenerator.js";
import { enforceTopStudentOverlap } from "./helper/studentOverlap.js";

function generateCGPA(rng) {
  const a = rng();
  const b = rng();
  const c = rng();

  const normalized = (a + b + c) / 3;

  let cgpa = 5.5 + normalized * 4.5;

  cgpa = Math.max(5.0, Math.min(10.0, cgpa));

  return Number(cgpa.toFixed(2));
}

function generateDataset(seed) {
  const rng = mulberry32(seed);

  const companies = companyGenerator(rng);
  const students = studentGenerator(rng);

  generateShortlists(rng, companies, students);
  enforceTopStudentOverlap(rng, companies, students);
}
