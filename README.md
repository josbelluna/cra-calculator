# Express Entry CRS calculator

A compact Comprehensive Ranking System (CRS) calculator using the Express Entry rules that take effect on **November 3, 2026**:

- Extra points for Canadian work experience in a high-wage NOC: +70 / +40 / +20 for 2x / 1.5x / 1.3x the median wage.
- Job offer points only in high-wage NOCs: 100 / 70 / 50. No LMIA is required.
- You get the higher of the work experience option and the job offer option, never both. The cap is 150 points (140 with a spouse).

It also includes a lookup for all 186 NOCs on IRCC's high-wage list.

Profiles (your inputs, not scores) are saved in `localStorage`. Duplicate a profile to try what-if changes. Scores are always recalculated from the profile, so saved profiles stay correct when the rules or NOC list change.

Sources: [CRS criteria](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/crs-criteria.html), [high-wage changes](https://www.canada.ca/en/immigration-refugees-citizenship/news/2026/10/changes-to-express-entry-for-high-wage-occupations.html), [high-wage NOC list](https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/high-wage.html).

## Development

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm test     # scoring unit tests
pnpm build
```
