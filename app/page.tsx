import { Calculator } from "@/components/Calculator";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 p-3 sm:p-4">
      <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-lg font-bold">
          <span className="text-red-600">Express Entry</span> CRS calculator
        </h1>
        <p className="text-xs text-zinc-500">
          Includes high-wage NOC points and LMIA-free job offers effective Nov 3, 2026. Estimate only.
        </p>
      </header>
      <Calculator />
      <footer className="mt-4 text-[11px] text-zinc-500">
        Sources:{" "}
        <a
          className="underline"
          href="https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html"
        >
          CRS criteria
        </a>
        ,{" "}
        <a
          className="underline"
          href="https://www.canada.ca/en/immigration-refugees-citizenship/news/2026/10/changes-to-express-entry-for-high-wage-occupations.html"
        >
          high-wage changes
        </a>
        . Not affiliated with IRCC.
      </footer>
    </main>
  );
}
