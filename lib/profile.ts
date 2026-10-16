export const EDUCATION_LEVELS = [
  { id: "none", label: "Less than secondary school" },
  { id: "secondary", label: "Secondary diploma (high school)" },
  { id: "oneYear", label: "One-year post-secondary program" },
  { id: "twoYear", label: "Two-year post-secondary program" },
  { id: "bachelor", label: "Bachelor's or 3+ year program" },
  { id: "twoOrMore", label: "Two or more credentials (one 3+ years)" },
  { id: "masters", label: "Master's or professional degree" },
  { id: "phd", label: "Doctoral degree (PhD)" },
] as const;

export type Education = (typeof EDUCATION_LEVELS)[number]["id"];

export type Clb = { reading: number; writing: number; speaking: number; listening: number };

export type HighWageJob = { noc: string; months: number };

export type Profile = {
  hasSpouse: boolean;
  age: number;
  education: Education;
  firstLanguage: "english" | "french";
  firstLangClb: Clb;
  hasSecondLang: boolean;
  secondLangClb: Clb;
  canadianWorkYears: number;
  highWageJobs: HighWageJob[];
  foreignWorkYears: number;
  certificateOfQualification: boolean;
  jobOfferNoc: string;
  spouse: {
    education: Education;
    clb: Clb;
    canadianWorkYears: number;
  };
  provincialNomination: boolean;
  siblingInCanada: boolean;
  canadianEducation: "none" | "short" | "long";
};

const zeroClb = (): Clb => ({ reading: 0, writing: 0, speaking: 0, listening: 0 });

export function defaultProfile(): Profile {
  return {
    hasSpouse: false,
    age: 29,
    education: "bachelor",
    firstLanguage: "english",
    firstLangClb: { reading: 9, writing: 9, speaking: 9, listening: 9 },
    hasSecondLang: false,
    secondLangClb: zeroClb(),
    canadianWorkYears: 0,
    highWageJobs: [],
    foreignWorkYears: 0,
    certificateOfQualification: false,
    jobOfferNoc: "",
    spouse: { education: "bachelor", clb: zeroClb(), canadianWorkYears: 0 },
    provincialNomination: false,
    siblingInCanada: false,
    canadianEducation: "none",
  };
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const int = (v: unknown, min: number, max: number, fallback: number) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.min(max, Math.max(min, Math.round(v)))
    : fallback;

const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);

const oneOf = <T extends string>(v: unknown, options: readonly T[], fallback: T): T =>
  options.includes(v as T) ? (v as T) : fallback;

const EDUCATION_IDS = EDUCATION_LEVELS.map((e) => e.id);

function normalizeClb(v: unknown, fallback: Clb): Clb {
  if (!isObj(v)) return fallback;
  return {
    reading: int(v.reading, 0, 12, fallback.reading),
    writing: int(v.writing, 0, 12, fallback.writing),
    speaking: int(v.speaking, 0, 12, fallback.speaking),
    listening: int(v.listening, 0, 12, fallback.listening),
  };
}

/** Coerces untrusted (e.g. localStorage) data into a valid Profile, filling gaps with defaults. */
export function normalizeProfile(input: unknown): Profile {
  const d = defaultProfile();
  if (!isObj(input)) return d;
  const spouse = isObj(input.spouse) ? input.spouse : {};
  const jobs = Array.isArray(input.highWageJobs) ? input.highWageJobs : [];
  return {
    hasSpouse: bool(input.hasSpouse, d.hasSpouse),
    age: int(input.age, 0, 99, d.age),
    education: oneOf(input.education, EDUCATION_IDS, d.education),
    firstLanguage: oneOf(input.firstLanguage, ["english", "french"] as const, d.firstLanguage),
    firstLangClb: normalizeClb(input.firstLangClb, d.firstLangClb),
    hasSecondLang: bool(input.hasSecondLang, d.hasSecondLang),
    secondLangClb: normalizeClb(input.secondLangClb, d.secondLangClb),
    canadianWorkYears: int(input.canadianWorkYears, 0, 10, d.canadianWorkYears),
    highWageJobs: jobs.filter(isObj).map((j) => ({
      noc: typeof j.noc === "string" ? j.noc.trim().slice(0, 5) : "",
      months: int(j.months, 0, 120, 0),
    })),
    foreignWorkYears: int(input.foreignWorkYears, 0, 10, d.foreignWorkYears),
    certificateOfQualification: bool(input.certificateOfQualification, d.certificateOfQualification),
    jobOfferNoc: typeof input.jobOfferNoc === "string" ? input.jobOfferNoc.trim().slice(0, 5) : "",
    spouse: {
      education: oneOf(spouse.education, EDUCATION_IDS, d.spouse.education),
      clb: normalizeClb(spouse.clb, d.spouse.clb),
      canadianWorkYears: int(spouse.canadianWorkYears, 0, 10, d.spouse.canadianWorkYears),
    },
    provincialNomination: bool(input.provincialNomination, d.provincialNomination),
    siblingInCanada: bool(input.siblingInCanada, d.siblingInCanada),
    canadianEducation: oneOf(input.canadianEducation, ["none", "short", "long"] as const, d.canadianEducation),
  };
}
