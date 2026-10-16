"use client";

import { findNoc } from "@/lib/highWageNocs";
import { EDUCATION_LEVELS, type Profile } from "@/lib/profile";
import { Card, ClbInputs, Field, Select, Toggle, buttonClass, inputClass, range, selectClass } from "./fields";
import { TierBadge } from "./TierBadge";

const EDUCATION_OPTIONS = EDUCATION_LEVELS.map((e) => ({ value: e.id, label: e.label }));
const AGE_OPTIONS = range(17, 45, (n) => (n === 17 ? "17 or less" : n === 45 ? "45 or more" : String(n)));
const YEARS_5 = range(0, 5, (n) => (n === 0 ? "None / < 1 yr" : n === 5 ? "5+ yrs" : `${n} yr`));
const YEARS_3 = range(0, 3, (n) => (n === 0 ? "None / < 1 yr" : n === 3 ? "3+ yrs" : `${n} yr`));

function NocInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const noc = value.length === 5 ? findNoc(value) : undefined;
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <input
        aria-label={label}
        className={`${inputClass} font-mono`}
        inputMode="numeric"
        maxLength={5}
        placeholder="NOC code"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      />
      {value.length === 5 && (
        <span className="flex items-center gap-1.5 truncate text-xs text-zinc-500">
          {noc ? (
            <>
              <TierBadge tier={noc.tier} />
              <span className="truncate">{noc.title}</span>
            </>
          ) : (
            "Not on the high-wage list (0 bonus points)"
          )}
        </span>
      )}
    </div>
  );
}

export function ProfileForm({ profile, onChange }: { profile: Profile; onChange: (p: Profile) => void }) {
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => onChange({ ...profile, [key]: value });
  const setSpouse = <K extends keyof Profile["spouse"]>(key: K, value: Profile["spouse"][K]) =>
    onChange({ ...profile, spouse: { ...profile.spouse, [key]: value } });
  const otherLanguage = profile.firstLanguage === "english" ? "French" : "English";

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Card title="You">
        <div className="grid grid-cols-2 gap-2">
          <Select label="Age" value={profile.age} options={AGE_OPTIONS} onChange={(v) => set("age", v)} />
          <Select
            label="Education"
            value={profile.education}
            options={EDUCATION_OPTIONS}
            onChange={(v) => set("education", v)}
          />
          <div className="col-span-2">
            <Toggle
              label="Spouse/partner coming with you (not a Canadian citizen or PR)"
              checked={profile.hasSpouse}
              onChange={(v) => set("hasSpouse", v)}
            />
          </div>
        </div>
      </Card>

      <Card title="Language (CLB / NCLC)">
        <div className="flex flex-col gap-2">
          <Select
            label="First official language"
            value={profile.firstLanguage}
            options={[
              { value: "english", label: "English" },
              { value: "french", label: "French" },
            ]}
            onChange={(v) => set("firstLanguage", v)}
          />
          <ClbInputs label="First language test" value={profile.firstLangClb} onChange={(v) => set("firstLangClb", v)} />
          <Toggle
            label={`I also have a ${otherLanguage} test`}
            checked={profile.hasSecondLang}
            onChange={(v) => set("hasSecondLang", v)}
          />
          {profile.hasSecondLang && (
            <ClbInputs label={`${otherLanguage} test`} value={profile.secondLangClb} onChange={(v) => set("secondLangClb", v)} />
          )}
        </div>
      </Card>

      <Card title="Work">
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Select
              label="Canadian work experience"
              value={profile.canadianWorkYears}
              options={YEARS_5}
              onChange={(v) => set("canadianWorkYears", v)}
            />
            <Select
              label="Foreign work experience"
              value={profile.foreignWorkYears}
              options={YEARS_3}
              onChange={(v) => set("foreignWorkYears", v)}
            />
          </div>
          <Toggle
            label="Certificate of qualification (trades)"
            checked={profile.certificateOfQualification}
            onChange={(v) => set("certificateOfQualification", v)}
          />

          <div className="flex flex-col gap-1.5 border-t border-zinc-200 pt-2 dark:border-zinc-800">
            <span className="text-xs text-zinc-600 dark:text-zinc-400">
              Canadian jobs in high-wage NOCs (months, last 10 years)
            </span>
            {profile.highWageJobs.map((job, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <NocInput
                  label={`High-wage job ${i + 1} NOC`}
                  value={job.noc}
                  onChange={(noc) =>
                    set("highWageJobs", profile.highWageJobs.map((j, k) => (k === i ? { ...j, noc } : j)))
                  }
                />
                <input
                  aria-label={`High-wage job ${i + 1} months`}
                  className={`${inputClass} w-16 shrink-0`}
                  type="number"
                  min={0}
                  max={120}
                  value={job.months}
                  onChange={(e) =>
                    set(
                      "highWageJobs",
                      profile.highWageJobs.map((j, k) =>
                        k === i ? { ...j, months: Math.max(0, Math.min(120, Number(e.target.value) || 0)) } : j,
                      ),
                    )
                  }
                />
                <button
                  type="button"
                  aria-label={`Remove high-wage job ${i + 1}`}
                  className={`${buttonClass} shrink-0`}
                  onClick={() => set("highWageJobs", profile.highWageJobs.filter((_, k) => k !== i))}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              className={`${buttonClass} self-start`}
              onClick={() => set("highWageJobs", [...profile.highWageJobs, { noc: "", months: 12 }])}
            >
              + Add job
            </button>
          </div>

          <div className="flex flex-col gap-1 border-t border-zinc-200 pt-2 dark:border-zinc-800">
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Qualifying job offer NOC (no LMIA needed)</span>
            <NocInput label="Job offer NOC" value={profile.jobOfferNoc} onChange={(v) => set("jobOfferNoc", v)} />
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        {profile.hasSpouse && (
          <Card title="Spouse or partner">
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Select
                  label="Education"
                  value={profile.spouse.education}
                  options={EDUCATION_OPTIONS}
                  onChange={(v) => setSpouse("education", v)}
                />
                <Select
                  label="Canadian work"
                  value={profile.spouse.canadianWorkYears}
                  options={YEARS_5}
                  onChange={(v) => setSpouse("canadianWorkYears", v)}
                />
              </div>
              <ClbInputs label="First language test" value={profile.spouse.clb} onChange={(v) => setSpouse("clb", v)} />
            </div>
          </Card>
        )}

        <Card title="Additional">
          <div className="flex flex-col gap-2">
            <Toggle
              label="Provincial or territorial nomination"
              checked={profile.provincialNomination}
              onChange={(v) => set("provincialNomination", v)}
            />
            <Toggle
              label="Sibling in Canada (citizen or PR, 18+)"
              checked={profile.siblingInCanada}
              onChange={(v) => set("siblingInCanada", v)}
            />
            <Field label="Canadian post-secondary education">
              <select
                className={selectClass}
                value={profile.canadianEducation}
                onChange={(e) => set("canadianEducation", e.target.value as Profile["canadianEducation"])}
              >
                <option value="none">None</option>
                <option value="short">1 or 2 year credential</option>
                <option value="long">3+ year credential</option>
              </select>
            </Field>
          </div>
        </Card>
      </div>
    </div>
  );
}
