import { describe, expect, it } from "vitest";
import { calculateCrs, highWageWorkTier } from "./crs";
import { HIGH_WAGE_NOCS, searchNocs } from "./highWageNocs";
import { defaultProfile, normalizeProfile, type Profile } from "./profile";

const clb = (n: number) => ({ reading: n, writing: n, speaking: n, listening: n });
const make = (overrides: Partial<Profile> = {}): Profile => ({ ...defaultProfile(), ...overrides });
const section = (p: Profile, id: string) => calculateCrs(p).sections.find((s) => s.id === id);

describe("high-wage NOC list", () => {
  it("has 186 unique occupations split 31 / 89 / 66", () => {
    expect(HIGH_WAGE_NOCS).toHaveLength(186);
    expect(new Set(HIGH_WAGE_NOCS.map((n) => n.code)).size).toBe(186);
    const count = (t: string) => HIGH_WAGE_NOCS.filter((n) => n.tier === t).length;
    expect([count("2x"), count("1.5x"), count("1.3x")]).toEqual([31, 89, 66]);
  });

  it("searches by code prefix and title words", () => {
    expect(searchNocs("21231")[0].title).toBe("Software engineers and designers");
    expect(searchNocs("software developers").map((n) => n.code)).toContain("21232");
  });
});

describe("calculateCrs", () => {
  it("scores a single 29-year-old with a bachelor's and CLB 9", () => {
    // 110 age + 120 education + 4*31 language + 25 education/language transferability
    expect(calculateCrs(make()).total).toBe(379);
  });

  it("uses the with-spouse grid and adds spouse factors", () => {
    const p = make({
      hasSpouse: true,
      spouse: { education: "masters", clb: clb(9), canadianWorkYears: 1 },
    });
    // 100 + 112 + 4*29 + 25 transferability + (10 + 20 + 5) spouse
    expect(calculateCrs(p).total).toBe(388);
  });

  it("adds a high-wage bonus to Canadian work experience", () => {
    const p = make({ canadianWorkYears: 3, highWageJobs: [{ noc: "21231", months: 36 }] });
    expect(section(p, "labourMarket")?.points).toBe(64 + 40);
  });

  it("combines months across tiers at the lowest qualifying tier", () => {
    const p = make({
      canadianWorkYears: 1,
      highWageJobs: [
        { noc: "20012", months: 6 },
        { noc: "21231", months: 6 },
      ],
    });
    expect(highWageWorkTier(p)).toBe("1.5x");
  });

  it("caps labour market integration at 150 single and 140 with spouse", () => {
    const jobs = [{ noc: "20010", months: 60 }];
    expect(section(make({ canadianWorkYears: 5, highWageJobs: jobs }), "labourMarket")?.points).toBe(150);
    expect(
      section(make({ hasSpouse: true, canadianWorkYears: 5, highWageJobs: jobs }), "labourMarket")?.points,
    ).toBe(140);
  });

  it("takes the job offer only when it beats work experience, never both", () => {
    const offer = make({ canadianWorkYears: 2, jobOfferNoc: "20010" });
    expect(calculateCrs(offer).labourMarket.chosen).toBe("jobOffer");
    expect(section(offer, "labourMarket")?.points).toBe(100);

    const work = make({
      canadianWorkYears: 1,
      highWageJobs: [{ noc: "20010", months: 12 }],
      jobOfferNoc: "20010",
    });
    expect(calculateCrs(work).labourMarket.chosen).toBe("workExperience");
    expect(section(work, "labourMarket")?.points).toBe(110);
  });

  it.each([
    ["20010", 100],
    ["21231", 70],
    ["21234", 50],
    ["62020", 0],
  ])("job offer in NOC %s earns %i points", (noc, points) => {
    expect(calculateCrs(make({ jobOfferNoc: noc })).labourMarket.jobOffer).toBe(points);
  });

  it("warns when a job offer NOC is not high-wage", () => {
    expect(calculateCrs(make({ jobOfferNoc: "62020" })).warnings).toHaveLength(1);
  });

  it("awards French bonus points", () => {
    const p = make({ hasSecondLang: true, secondLangClb: clb(7) });
    expect(section(p, "additional")?.points).toBe(50);
  });

  it("caps skill transferability at 100", () => {
    const p = make({
      education: "masters",
      canadianWorkYears: 2,
      foreignWorkYears: 3,
      certificateOfQualification: true,
    });
    expect(section(p, "transferability")?.points).toBe(100);
  });
});

describe("normalizeProfile", () => {
  it("falls back to defaults for garbage input", () => {
    expect(normalizeProfile("nope")).toEqual(defaultProfile());
    expect(normalizeProfile({ age: "x", education: "wizard" }).education).toBe("bachelor");
  });

  it("clamps out-of-range values", () => {
    const p = normalizeProfile({ age: 400, firstLangClb: { reading: 20 } });
    expect(p.age).toBe(99);
    expect(p.firstLangClb.reading).toBe(12);
  });
});
