import type { ReactNode } from "react";
import type { Clb } from "@/lib/profile";

export const inputClass =
  "h-8 w-full rounded-md border border-zinc-300 bg-white px-2 text-sm outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 dark:border-zinc-700 dark:bg-zinc-900";

export const buttonClass =
  "h-8 rounded-md border border-zinc-300 px-2.5 text-xs font-medium hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent dark:border-zinc-700 dark:hover:bg-zinc-800";

export function Card({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <header className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">{title}</h2>
        {aside}
      </header>
      {children}
    </section>
  );
}

export function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-400 ${className}`}>
      {label}
      {children}
    </label>
  );
}

export function Select<T extends string | number>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <Field label={label} className={className}>
      <select
        className={inputClass}
        value={String(value)}
        onChange={(e) => {
          const match = options.find((o) => String(o.value) === e.target.value);
          if (match) onChange(match.value);
        }}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        className="size-4 accent-red-600"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export const range = (from: number, to: number, label: (n: number) => string = String) =>
  Array.from({ length: to - from + 1 }, (_, i) => ({ value: from + i, label: label(from + i) }));

const CLB_OPTIONS = range(0, 12, (n) => (n === 0 ? "-" : String(n)));
const ABILITIES: { key: keyof Clb; label: string }[] = [
  { key: "reading", label: "R" },
  { key: "writing", label: "W" },
  { key: "speaking", label: "S" },
  { key: "listening", label: "L" },
];

export function ClbInputs({ label, value, onChange }: { label: string; value: Clb; onChange: (v: Clb) => void }) {
  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1 text-xs text-zinc-600 dark:text-zinc-400">{label}</legend>
      <div className="grid grid-cols-4 gap-1.5">
        {ABILITIES.map(({ key, label: short }) => (
          <label key={key} className="flex items-center gap-1 text-xs text-zinc-500">
            <span title={key} className="w-3">
              {short}
            </span>
            <select
              aria-label={`${label} ${key}`}
              className={inputClass}
              value={value[key]}
              onChange={(e) => onChange({ ...value, [key]: Number(e.target.value) })}
            >
              {CLB_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
