export type WageTier = "2x" | "1.5x" | "1.3x";

export type HighWageNoc = {
  code: string;
  title: string;
  tier: WageTier;
};

/** Effective November 3, 2026. Based on 2023-2025 wage data. */
export const NOC_LIST_EFFECTIVE = "2026-11-03";
export const NOC_LIST_SOURCE =
  "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry/check-score/high-wage.html";

const TIER_2X: [string, string][] = [
  ["00011", "Senior government managers and officials"],
  ["00012", "Senior managers - financial, communications and other business services"],
  ["00013", "Senior managers - health, education, social and community services and membership organizations"],
  ["10010", "Financial managers"],
  ["10011", "Human resources managers"],
  ["10012", "Purchasing managers"],
  ["10020", "Insurance, real estate and financial brokerage managers"],
  ["10021", "Banking, credit and other investment managers"],
  ["20010", "Engineering managers"],
  ["20011", "Architecture and science managers"],
  ["20012", "Computer and information systems managers"],
  ["21330", "Mining engineers"],
  ["21332", "Petroleum engineers"],
  ["31100", "Specialists in clinical and laboratory medicine"],
  ["31101", "Specialists in surgery"],
  ["31102", "General practitioners and family physicians"],
  ["31103", "Veterinarians"],
  ["31302", "Nurse practitioners"],
  ["31303", "Physician assistants, midwives and allied health professionals"],
  ["40010", "Government managers - health and social policy development and program administration"],
  ["40011", "Government managers - economic analysis, policy development and program administration"],
  ["40012", "Government managers - education policy development and program administration"],
  ["40019", "Other managers in public administration"],
  ["40040", "Commissioned police officers and related occupations in public protection services"],
  ["40041", "Fire chiefs and senior firefighting officers"],
  ["41100", "Judges"],
  ["41101", "Lawyers and Quebec notaries"],
  ["41200", "University professors and lecturers"],
  ["60010", "Corporate sales managers"],
  ["80010", "Managers in natural resources production and fishing"],
  ["90011", "Utilities managers"],
];

const TIER_1_5X: [string, string][] = [
  ["00014", "Senior managers - trade, broadcasting and other services"],
  ["00015", "Senior managers - construction, transportation, production and utilities"],
  ["10019", "Other administrative services managers"],
  ["10022", "Advertising, marketing and public relations managers"],
  ["10029", "Other business services managers"],
  ["10030", "Telecommunication carriers managers"],
  ["11103", "Securities agents, investment dealers and brokers"],
  ["11201", "Professional occupations in business management consulting"],
  ["21100", "Physicists and astronomers"],
  ["21102", "Geoscientists and oceanographers"],
  ["21103", "Meteorologists and climatologists"],
  ["21109", "Other professional occupations in physical sciences"],
  ["21111", "Forestry professionals"],
  ["21120", "Public and environmental health and safety professionals"],
  ["21202", "Urban and land use planners"],
  ["21210", "Mathematicians, statisticians and actuaries"],
  ["21211", "Data scientists"],
  ["21220", "Cybersecurity specialists"],
  ["21221", "Business systems specialists"],
  ["21222", "Information systems specialists"],
  ["21223", "Database analysts and data administrators"],
  ["21230", "Computer systems developers and programmers"],
  ["21231", "Software engineers and designers"],
  ["21232", "Software developers and programmers"],
  ["21300", "Civil engineers"],
  ["21301", "Mechanical engineers"],
  ["21310", "Electrical and electronics engineers"],
  ["21311", "Computer engineers (except software engineers and designers)"],
  ["21320", "Chemical engineers"],
  ["21321", "Industrial and manufacturing engineers"],
  ["21322", "Metallurgical and materials engineers"],
  ["21331", "Geological engineers"],
  ["21390", "Aerospace engineers"],
  ["21399", "Other professional engineers"],
  ["22231", "Engineering inspectors and regulatory officers"],
  ["22312", "Industrial instrument technicians and mechanics"],
  ["30010", "Managers in health care"],
  ["31110", "Dentists"],
  ["31112", "Audiologists and speech-language pathologists"],
  ["31120", "Pharmacists"],
  ["31200", "Psychologists"],
  ["31202", "Physiotherapists"],
  ["31203", "Occupational therapists"],
  ["31300", "Nursing coordinators and supervisors"],
  ["31301", "Registered nurses and registered psychiatric nurses"],
  ["32111", "Dental hygienists and dental therapists"],
  ["40020", "Administrators - post-secondary education and vocational training"],
  ["40021", "School principals and administrators of elementary and secondary education"],
  ["40030", "Managers in social, community and correctional services"],
  ["40042", "Commissioned officers of the Canadian Armed Forces"],
  ["41210", "College and other vocational instructors"],
  ["41220", "Secondary school teachers"],
  ["41221", "Elementary school and kindergarten teachers"],
  ["41310", "Police investigators and other investigative occupations"],
  ["41311", "Probation and parole officers"],
  ["41320", "Educational counsellors"],
  ["41401", "Economists and economic policy researchers and analysts"],
  ["41402", "Business development officers and market researchers and analysts"],
  ["41404", "Health policy researchers, consultants and program officers"],
  ["41407", "Program officers unique to government"],
  ["42100", "Police officers (except commissioned)"],
  ["42101", "Firefighters"],
  ["50010", "Library, archive, museum and art gallery managers"],
  ["50011", "Managers - publishing, motion pictures, broadcasting and performing arts"],
  ["51100", "Librarians"],
  ["70010", "Construction managers"],
  ["70012", "Facility operation and maintenance managers"],
  ["70020", "Managers in transportation"],
  ["70021", "Postal and courier services managers"],
  ["72011", "Contractors and supervisors, electrical trades and telecommunications occupations"],
  ["72012", "Contractors and supervisors, pipefitting trades"],
  ["72023", "Supervisors, railway transport operations"],
  ["72103", "Boilermakers"],
  ["72202", "Power system electricians"],
  ["72203", "Electrical power line and cable workers"],
  ["72301", "Steamfitters, pipefitters and sprinkler system installers"],
  ["72406", "Elevator constructors and mechanics"],
  ["72600", "Air pilots, flight engineers and flying instructors"],
  ["72601", "Air traffic controllers and related occupations"],
  ["72604", "Railway traffic controllers and marine traffic regulators"],
  ["73310", "Railway and yard locomotive engineers"],
  ["82020", "Supervisors, mining and quarrying"],
  ["82021", "Contractors and supervisors, oil and gas drilling and services"],
  ["83101", "Oil and gas well drillers, servicers, testers and related workers"],
  ["90010", "Manufacturing managers"],
  ["92011", "Supervisors, petroleum, gas and chemical processing and utilities"],
  ["92100", "Power engineers and power systems operators"],
  ["93100", "Central control and process operators, mineral and metal processing"],
  ["93101", "Central control and process operators, petroleum, gas and chemical processing"],
];

const TIER_1_3X: [string, string][] = [
  ["00010", "Legislators"],
  ["11100", "Financial auditors and accountants"],
  ["11101", "Financial and investment analysts"],
  ["11102", "Financial advisors"],
  ["11109", "Other financial officers"],
  ["11200", "Human resources professionals"],
  ["12201", "Insurance adjusters and claims examiners"],
  ["12203", "Assessors, business valuators and appraisers"],
  ["21101", "Chemists"],
  ["21110", "Biologists and related scientists"],
  ["21112", "Agricultural representatives, consultants and specialists"],
  ["21200", "Architects"],
  ["21201", "Landscape architects"],
  ["21203", "Land surveyors"],
  ["21234", "Web developers and programmers"],
  ["22214", "Technical occupations in geomatics and meteorology"],
  ["22232", "Occupational health and safety specialists"],
  ["22233", "Construction inspectors"],
  ["22310", "Electrical and electronics engineering technologists and technicians"],
  ["22313", "Aircraft instrument, electrical and avionics mechanics, technicians and inspectors"],
  ["31121", "Dietitians and nutritionists"],
  ["32102", "Paramedical occupations"],
  ["32103", "Respiratory therapists, clinical perfusionists and cardiopulmonary technologists"],
  ["32120", "Medical laboratory technologists"],
  ["32121", "Medical radiation technologists"],
  ["32122", "Medical sonographers"],
  ["41300", "Social workers"],
  ["41400", "Natural and applied science policy researchers, consultants and program officers"],
  ["41403", "Social policy researchers, consultants and program officers"],
  ["41405", "Education policy researchers, consultants and program officers"],
  ["41409", "Other professional occupations in social science"],
  ["43201", "Correctional service officers"],
  ["43203", "Border services, customs, and immigration officers"],
  ["50012", "Recreation, sports and fitness program and service directors"],
  ["51101", "Conservators and curators"],
  ["51102", "Archivists"],
  ["51111", "Authors and writers (except technical)"],
  ["51112", "Technical writers"],
  ["51120", "Producers, directors, choreographers and related occupations"],
  ["52112", "Broadcast technicians"],
  ["60020", "Retail and wholesale trade managers"],
  ["60031", "Accommodation service managers"],
  ["60040", "Managers in customer and personal services"],
  ["72010", "Contractors and supervisors, machining, metal forming, shaping and erecting trades and related occupations"],
  ["72013", "Contractors and supervisors, carpentry trades"],
  ["72014", "Contractors and supervisors, other construction trades, installers, repairers and servicers"],
  ["72020", "Contractors and supervisors, mechanic trades"],
  ["72021", "Contractors and supervisors, heavy equipment operator crews"],
  ["72102", "Sheet metal workers"],
  ["72105", "Ironworkers"],
  ["72201", "Industrial electricians"],
  ["72302", "Gas fitters"],
  ["72320", "Bricklayers"],
  ["72321", "Insulators"],
  ["72401", "Heavy-duty equipment mechanics"],
  ["72403", "Railway carmen/women"],
  ["72404", "Aircraft mechanics and aircraft inspectors"],
  ["72500", "Crane operators"],
  ["72602", "Deck officers, water transport"],
  ["72603", "Engineer officers, water transport"],
  ["73311", "Railway conductors and brakemen/women"],
  ["82010", "Supervisors, logging and forestry"],
  ["83100", "Underground production and development miners"],
  ["83120", "Fishing masters and officers"],
  ["92010", "Supervisors, mineral and metal processing"],
  ["93102", "Pulping, papermaking and coating control operators"],
];

const withTier = (rows: [string, string][], tier: WageTier): HighWageNoc[] =>
  rows.map(([code, title]) => ({ code, title, tier }));

export const HIGH_WAGE_NOCS: HighWageNoc[] = [
  ...withTier(TIER_2X, "2x"),
  ...withTier(TIER_1_5X, "1.5x"),
  ...withTier(TIER_1_3X, "1.3x"),
];

const BY_CODE = new Map(HIGH_WAGE_NOCS.map((n) => [n.code, n]));

export function findNoc(code: string): HighWageNoc | undefined {
  return BY_CODE.get(code.trim());
}

export function tierOf(code: string): WageTier | null {
  return findNoc(code)?.tier ?? null;
}

export const TIER_RANK: Record<WageTier, number> = { "2x": 3, "1.5x": 2, "1.3x": 1 };

/** Bonus on top of duration-based Canadian work experience, for 12+ months at the tier. */
export const WORK_EXPERIENCE_BONUS: Record<WageTier, number> = {
  "2x": 70,
  "1.5x": 40,
  "1.3x": 20,
};

export const JOB_OFFER_POINTS: Record<WageTier, number> = {
  "2x": 100,
  "1.5x": 70,
  "1.3x": 50,
};

export function searchNocs(query: string, limit = 12): HighWageNoc[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/);
  return HIGH_WAGE_NOCS.filter((n) => {
    if (n.code.startsWith(q)) return true;
    const title = n.title.toLowerCase();
    return terms.every((t) => title.includes(t));
  }).slice(0, limit);
}
