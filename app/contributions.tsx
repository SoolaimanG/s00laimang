import { ContributionsGrid, type ContributionDay } from "./contributions-grid";

type ApiResponse = {
  total: { lastYear: number };
  contributions: ContributionDay[];
};

const GITHUB_ACCOUNTS = ["SoolaimanG", "s00laimang"];

// the API's per-year cache entries are fresher than its "y=last" key,
// so we fetch explicit years and slice the trailing 365 days ourselves
async function fetchAccountYear(
  user: string,
  year: number
): Promise<ApiResponse | null> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${user}?y=${year}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// merge day-by-day counts across accounts and years, then rebuild levels
// relative to the combined max the way GitHub buckets its own graph
async function getContributions(): Promise<ApiResponse | null> {
  const now = new Date();
  const years = [now.getFullYear() - 1, now.getFullYear()];
  const results = (
    await Promise.all(
      GITHUB_ACCOUNTS.flatMap((user) =>
        years.map((year) => fetchAccountYear(user, year))
      )
    )
  ).filter((r): r is ApiResponse => r !== null);
  if (results.length === 0) return null;

  const byDate = new Map<string, number>();
  for (const result of results) {
    for (const day of result.contributions) {
      byDate.set(day.date, (byDate.get(day.date) ?? 0) + day.count);
    }
  }

  const end = now.toISOString().slice(0, 10);
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 364);
  const start = startDate.toISOString().slice(0, 10);

  const dates = [...byDate.keys()]
    .filter((d) => d >= start && d <= end)
    .sort();
  const counts = dates.map((d) => byDate.get(d)!);
  const max = Math.max(...counts, 1);
  const contributions = dates.map((date, i) => {
    const count = counts[i];
    const level =
      count === 0
        ? 0
        : (Math.min(4, Math.ceil((count / max) * 4)) as ContributionDay["level"]);
    return { date, count, level } as ContributionDay;
  });

  return {
    total: { lastYear: counts.reduce((sum, c) => sum + c, 0) },
    contributions,
  };
}

export async function Contributions() {
  const data = await getContributions();
  if (!data) return null;

  // pad the first week so columns start on Sunday
  const days = data.contributions;
  const weeks: (ContributionDay | null)[][] = [];
  let week: (ContributionDay | null)[] = new Array(
    new Date(days[0].date).getDay()
  ).fill(null);

  for (const day of days) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push(week);

  return (
    <section className="mt-16">
      <h2 className="font-serif text-2xl tracking-tight">/My-Contributions</h2>
      <p className="mt-1 text-[15px] text-muted">
        {data.total.lastYear.toLocaleString()} contributions on GitHub in the
        last year
      </p>
      <ContributionsGrid weeks={weeks} />
    </section>
  );
}
