import {
  massRecruiterNames,
  midTierNames,
  highTierNames,
} from "../recruiterData";

const CONFIG = {
  TOTAL_COMPANIES: 35,
  TOTAL_STUDENTS: 800,
  TOTAL_ROOMS: 20,
  TOTAL_DAYS: 4,

  BRANCHES: ["CSE", "ISE", "ECE", "EEE", "ME", "CE"],

  COMPANY_TYPES: {
    MASS_RECRUITER: "mass_recruiter",
    MID_TIER: "mid_tier",
    HIGH_TIER: "high_tier",
  },
};

const companies = [];

export default function companyGenerator(rng) {
  //mass recruiters
  const massRecruiterCount = 7;
  for (let i = 0; i < massRecruiterCount; i++) {
    const companyId = `company-${String(i + 1).padStart(2, "0")}`;
    const cgpaCutoff = Number(randomFloat(rng, 6.0, 6.5).toFixed(1));
    const panelCount = randomInt(rng, 15, 30);
    const shortlistSize = randomInt(rng, 150, 300);

    const company = {
      id: companyId,
      name: massRecruiterNames[i],

      type: CONFIG.COMPANY_TYPES.MASS_RECRUITER,

      tier: 1,
      priorityTier: 1,

      day: 1,

      cgpaCutoff,

      branchRestrictions: [],

      shortlistTargetSize: shortlistSize,

      slotDuration: randomInt(rng, 15, 20),

      popularity: randomFloat(rng, 0.8, 1.0),

      panels: [],
    };

    for (let panelIndex = 0; panelIndex < panelCount; panelIndex++) {
      company.panels.push({
        id: `${companyId}-panel-${panelIndex + 1}`,
        companyId,
      });
    }

    companies.push(company);
  }

  //mid tier companies
  const midTierCount = 23;

  for (let i = 0; i < midTierCount; i++) {
    const companyNumber = companies.length + 1;

    const companyId = `company-${String(companyNumber).padStart(2, "0")}`;

    const day = i < 12 ? 2 : 3;

    const cgpaCutoff = Number(randomFloat(rng, 7.0, 7.7).toFixed(1));

    const panelCount = randomInt(rng, 3, 6);

    const shortlistSize = randomInt(rng, 40, 100);

    const branchRestricted = rng() < 0.6;

    const allowedBranches = branchRestricted
      ? sample(rng, CONFIG.BRANCHES, randomInt(rng, 2, 4))
      : [];

    const company = {
      id: companyId,
      name: midTierNames[i],

      type: CONFIG.COMPANY_TYPES.MID_TIER,

      tier: 2,
      priorityTier: 2,

      day,

      cgpaCutoff,

      branchRestrictions: allowedBranches,

      shortlistTargetSize: shortlistSize,

      slotDuration: randomInt(rng, 20, 30),

      popularity: randomFloat(rng, 0.4, 0.8),

      panels: [],
    };

    for (let panelIndex = 0; panelIndex < panelCount; panelIndex++) {
      company.panels.push({
        id: `${companyId}-panel-${panelIndex + 1}`,
        companyId,
      });
    }

    companies.push(company);
  }

  const highTierCount = 5;

  for (let i = 0; i < highTierCount; i++) {
    const companyNumber = companies.length + 1;

    const companyId = `company-${String(companyNumber).padStart(2, "0")}`;

    const cgpaCutoff = Number(randomFloat(rng, 8.5, 9.2).toFixed(1));

    const panelCount = randomInt(rng, 1, 2);

    const shortlistSize = randomInt(rng, 15, 30);

    const allowedBranches = sample(rng, CONFIG.BRANCHES, randomInt(rng, 1, 3));

    const company = {
      id: companyId,
      name: highTierNames[i],

      type: CONFIG.COMPANY_TYPES.HIGH_TIER,

      tier: 3,
      priorityTier: 3,

      day: 4,

      cgpaCutoff,

      branchRestrictions: allowedBranches,

      shortlistTargetSize: shortlistSize,

      slotDuration: randomInt(rng, 45, 60),

      popularity: randomFloat(rng, 0.2, 0.5),

      panels: [],
    };

    for (let panelIndex = 0; panelIndex < panelCount; panelIndex++) {
      company.panels.push({
        id: `${companyId}-panel-${panelIndex + 1}`,
        companyId,
      });
    }

    companies.push(company);
  }

  return companies;
}
