import {
  JOB_OFFER_POINTS,
  TIER_RANK,
  WORK_EXPERIENCE_BONUS,
  tierOf,
  type WageTier,
} from "./highWageNocs";
import type { Clb, Education, Profile } from "./profile";

export type Line = { label: string; points: number };

export type Section = {
  id: "core" | "spouse" | "transferability" | "labourMarket" | "additional";
  title: string;
  points: number;
  max: number;
  lines: Line[];
};

export type LabourMarket = {
  chosen: "workExperience" | "jobOffer" | "none";
  workBase: number;
  workBonus: number;
  workTier: WageTier | null;
  jobOffer: number;
  jobOfferTier: WageTier | null;
  cap: number;
};

export type Breakdown = {
  total: number;
  sections: Section[];
  labourMarket: LabourMarket;
  warnings: string[];
};

type Pair = readonly [withSpouse: number, single: number];
const pick = ([withSpouse, single]: Pair, hasSpouse: boolean) =>
  hasSpouse ? withSpouse : single;

const AGE: Record<number, Pair> = {
  18: [90, 99], 19: [95, 105], 30: [95, 105], 31: [90, 99], 32: [85, 94],
  33: [80, 88], 34: [75, 83], 35: [70, 77], 36: [65, 72], 37: [60, 66],
  38: [55, 61], 39: [50, 55], 40: [45, 50], 41: [35, 39], 42: [25, 28],
  43: [15, 17], 44: [5, 6],
};

export function agePoints(age: number, hasSpouse: boolean): number {
  if (age >= 20 && age <= 29) return hasSpouse ? 100 : 110;
  const row = AGE[age];
  return row ? pick(row, hasSpouse) : 0;
}

const EDUCATION: Record<Education, Pair> = {
  none: [0, 0],
  secondary: [28, 30],
  oneYear: [84, 90],
  twoYear: [91, 98],
  bachelor: [112, 120],
  twoOrMore: [119, 128],
  masters: [126, 135],
  phd: [140, 150],
};

const SPOUSE_EDUCATION: Record<Education, number> = {
  none: 0, secondary: 2, oneYear: 6, twoYear: 7, bachelor: 8, twoOrMore: 9, masters: 10, phd: 10,
};

function firstLangAbility(clb: number, hasSpouse: boolean): number {
  if (clb >= 10) return hasSpouse ? 32 : 34;
  if (clb === 9) return hasSpouse ? 29 : 31;
  if (clb === 8) return hasSpouse ? 22 : 23;
  if (clb === 7) return hasSpouse ? 16 : 17;
  if (clb === 6) return hasSpouse ? 8 : 9;
  if (clb >= 4) return 6;
  return 0;
}

function secondLangAbility(clb: number): number {
  if (clb >= 9) return 6;
  if (clb >= 7) return 3;
  if (clb >= 5) return 1;
  return 0;
}

function spouseLangAbility(clb: number): number {
  if (clb >= 9) return 5;
  if (clb >= 7) return 3;
  if (clb >= 5) return 1;
  return 0;
}

const abilities = (c: Clb) => [c.reading, c.writing, c.speaking, c.listening];
export const minClb = (c: Clb) => Math.min(...abilities(c));
const sumBy = (c: Clb, f: (n: number) => number) => abilities(c).reduce((s, n) => s + f(n), 0);

const CANADIAN_WORK: Pair[] = [[0, 0], [35, 40], [46, 53], [56, 64], [63, 72], [70, 80]];
const SPOUSE_CANADIAN_WORK = [0, 5, 7, 8, 9, 10];

export function canadianWorkPoints(years: number, hasSpouse: boolean): number {
  return pick(CANADIAN_WORK[Math.min(5, Math.max(0, years))], hasSpouse);
}

/** Highest tier with at least 12 months, counting months at that tier or above. */
export function highWageWorkTier(profile: Profile): WageTier | null {
  const tiers: WageTier[] = ["2x", "1.5x", "1.3x"];
  for (const tier of tiers) {
    const months = profile.highWageJobs.reduce((sum, job) => {
      const t = tierOf(job.noc);
      return t && TIER_RANK[t] >= TIER_RANK[tier] ? sum + job.months : sum;
    }, 0);
    if (months >= 12) return tier;
  }
  return null;
}

export function labourMarketIntegration(profile: Profile): LabourMarket {
  const { hasSpouse } = profile;
  const cap = hasSpouse ? 140 : 150;
  const workBase = canadianWorkPoints(profile.canadianWorkYears, hasSpouse);
  const workTier = profile.canadianWorkYears >= 1 ? highWageWorkTier(profile) : null;
  const workBonus = workTier ? WORK_EXPERIENCE_BONUS[workTier] : 0;
  const jobOfferTier = profile.jobOfferNoc ? tierOf(profile.jobOfferNoc) : null;
  const jobOffer = jobOfferTier ? JOB_OFFER_POINTS[jobOfferTier] : 0;
  const work = workBase + workBonus;

  let chosen: LabourMarket["chosen"] = "none";
  if (work > 0 || jobOffer > 0) chosen = jobOffer > work ? "jobOffer" : "workExperience";
  return { chosen, workBase, workBonus, workTier, jobOffer, jobOfferTier, cap };
}

type CredentialBand = 0 | 1 | 2;
function credentialBand(education: Education): CredentialBand {
  if (education === "none" || education === "secondary") return 0;
  if (education === "oneYear" || education === "twoYear" || education === "bachelor") return 1;
  return 2;
}

/** [lower, higher] points for a band in the skill transferability grids. */
const TRANSFER: Record<1 | 2, Pair> = { 1: [13, 25], 2: [25, 50] };
const transfer = (band: CredentialBand, higher: boolean) =>
  band === 0 ? 0 : TRANSFER[band][higher ? 1 : 0];

function frenchBonus(profile: Profile): number {
  const french = profile.firstLanguage === "french"
    ? profile.firstLangClb
    : profile.hasSecondLang ? profile.secondLangClb : null;
  if (!french || minClb(french) < 7) return 0;
  const english = profile.firstLanguage === "english"
    ? profile.firstLangClb
    : profile.hasSecondLang ? profile.secondLangClb : null;
  return english && minClb(english) >= 5 ? 50 : 25;
}

export function calculateCrs(profile: Profile): Breakdown {
  const { hasSpouse } = profile;
  const warnings: string[] = [];

  // Core / human capital, excluding Canadian work experience (now part of labour market integration).
  const firstLang = sumBy(profile.firstLangClb, (n) => firstLangAbility(n, hasSpouse));
  const secondLang = profile.hasSecondLang
    ? Math.min(hasSpouse ? 22 : 24, sumBy(profile.secondLangClb, secondLangAbility))
    : 0;
  const coreLines: Line[] = [
    { label: "Age", points: agePoints(profile.age, hasSpouse) },
    { label: "Education", points: pick(EDUCATION[profile.education], hasSpouse) },
    { label: "First official language", points: firstLang },
    { label: "Second official language", points: secondLang },
  ];

  // Spouse or common-law partner.
  const spouseLines: Line[] = hasSpouse
    ? [
        { label: "Education", points: SPOUSE_EDUCATION[profile.spouse.education] },
        { label: "First official language", points: sumBy(profile.spouse.clb, spouseLangAbility) },
        {
          label: "Canadian work experience",
          points: SPOUSE_CANADIAN_WORK[Math.min(5, profile.spouse.canadianWorkYears)],
        },
      ]
    : [];

  // Skill transferability.
  const lang = minClb(profile.firstLangClb);
  const cwe = profile.canadianWorkYears;
  const band = credentialBand(profile.education);
  const foreignBand: CredentialBand =
    profile.foreignWorkYears >= 3 ? 2 : profile.foreignWorkYears >= 1 ? 1 : 0;

  const eduLang = lang >= 7 ? transfer(band, lang >= 9) : 0;
  const eduCwe = cwe >= 1 ? transfer(band, cwe >= 2) : 0;
  const foreignLang = lang >= 7 ? transfer(foreignBand, lang >= 9) : 0;
  const foreignCwe = cwe >= 1 ? transfer(foreignBand, cwe >= 2) : 0;
  const coq = profile.certificateOfQualification && lang >= 5 ? (lang >= 7 ? 50 : 25) : 0;

  const transferLines: Line[] = [
    { label: "Education (language + Canadian work)", points: Math.min(50, eduLang + eduCwe) },
    { label: "Foreign work (language + Canadian work)", points: Math.min(50, foreignLang + foreignCwe) },
    { label: "Certificate of qualification", points: coq },
  ];

  // Labour market integration (Nov 3, 2026).
  const lm = labourMarketIntegration(profile);
  const lmLines: Line[] =
    lm.chosen === "jobOffer"
      ? [{ label: `Job offer, NOC ${profile.jobOfferNoc} (${lm.jobOfferTier} median)`, points: lm.jobOffer }]
      : [
          { label: `Canadian work experience (${Math.min(5, cwe)} yr)`, points: lm.workBase },
          {
            label: lm.workTier ? `High-wage bonus (${lm.workTier} median)` : "High-wage bonus",
            points: lm.workBonus,
          },
        ];

  if (profile.jobOfferNoc && !lm.jobOfferTier) {
    warnings.push(`NOC ${profile.jobOfferNoc} is not a high-wage occupation, so the job offer earns 0 points.`);
  }
  const hwMonths = profile.highWageJobs.reduce((s, j) => s + j.months, 0);
  if (hwMonths > 0 && hwMonths >= (cwe + 1) * 12) {
    warnings.push("High-wage months exceed your total Canadian work experience.");
  }

  // Additional points.
  const additionalLines: Line[] = [
    { label: "Provincial nomination", points: profile.provincialNomination ? 600 : 0 },
    { label: "French language skills", points: frenchBonus(profile) },
    {
      label: "Canadian post-secondary education",
      points: { none: 0, short: 15, long: 30 }[profile.canadianEducation],
    },
    { label: "Sibling in Canada", points: profile.siblingInCanada ? 15 : 0 },
  ];

  const sum = (lines: Line[]) => lines.reduce((s, l) => s + l.points, 0);
  const sections: Section[] = [
    { id: "core", title: "Core / human capital", points: sum(coreLines), max: hasSpouse ? 390 : 420, lines: coreLines },
    { id: "labourMarket", title: "Labour market integration", points: Math.min(lm.cap, sum(lmLines)), max: lm.cap, lines: lmLines },
    { id: "transferability", title: "Skill transferability", points: Math.min(100, sum(transferLines)), max: 100, lines: transferLines },
    ...(hasSpouse
      ? [{ id: "spouse" as const, title: "Spouse or partner", points: sum(spouseLines), max: 40, lines: spouseLines }]
      : []),
    { id: "additional", title: "Additional points", points: Math.min(600, sum(additionalLines)), max: 600, lines: additionalLines },
  ];

  return {
    total: sections.reduce((s, sec) => s + sec.points, 0),
    sections,
    labourMarket: lm,
    warnings,
  };
}
