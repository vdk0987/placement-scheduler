import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { mulberry32 } from "./helper/mulberry.js";
import { CONFIG } from "./recruiterData.js";

import { companyGenerator } from "./helper/companyGenerator.js";
import { studentGenerator } from "./helper/studentGenerator.js";
import { generateRooms } from "./helper/roomGenerator.js";
import { validateDataset, generateSummary } from "./helper/validateDataset.js";
import { generateShortlists } from "./helper/shortlistGenerator.js";
import { enforceTopStudentOverlap } from "./helper/studentOverlap.js";

function generateDataset(seed = 67) {
  const rng = mulberry32(seed);

  const companies = companyGenerator(rng);
  const students = studentGenerator(rng);

  const rooms = generateRooms(rng)

  generateShortlists(rng, companies, students);
  enforceTopStudentOverlap(rng, companies, students);

  const dataset = {
    metadata: {
      seed,
      generatedAt: new Date().toISOString(),

      configuration: {
        totalCompanies: CONFIG.TOTAL_COMPANIES,

        totalStudents: CONFIG.TOTAL_STUDENTS,

        totalRooms: CONFIG.TOTAL_ROOMS,

        totalDays: CONFIG.TOTAL_DAYS,
      },
    },
    companies,
    students,
    rooms,
  };

  validateDataset(dataset);

  dataset.metadata.summary = generateSummary(dataset);

  return dataset;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parseArguments = () => {
  const args = process.argv.slice(2);
  let seed = 67;
  let output = path.resolve(__dirname, "../../data/seed.json");

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--seed") {
      seed = Number(args[i + 1]);
    }
    if (args[i] === "--output") {
      output = path.resolve(args[i + 1]);
    }
  }

  return { seed, output };
};

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  const { seed, output } = parseArguments();
  const dataset = generateDataset(seed);

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(dataset, null, 2));

  console.log("\nDataset generated successfully.\n");
  console.log(JSON.stringify(dataset.metadata.summary, null, 2));

  console.log(`\nSeed: ${seed}`);
  console.log(`Output: ${output}\n`);
}

export { parseArguments };
