// GitHub詳細画面用のモックデータ。
// ダッシュボードと違い、粒度(日/週/月)の切り替えに対応する必要があるため、
// 「日別データを生成し、粒度に応じて週/月に集計する」という方式にしている。
import { TRACKED_REPOSITORIES } from './dashboard';
import type { PeriodRange } from '~/utils/period';

export type Granularity = 'day' | 'week' | 'month';

export interface CommitTimeseriesPoint {
  period: string;
  count: number;
}

function hashString(value: string): number {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) % 1000;
  }
  return hash;
}

// 日別のダミーコミット数を生成する(過去400日分。以降、粒度に応じて週/月へ集計する)
function getDailyCommits(repository: string): { date: Date; count: number }[] {
  const days = 400;
  const today = new Date();
  const seed = hashString(repository);
  const points: { date: Date; count: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const base = 0.6 + Math.sin(i / 10 + seed) * 0.5;
    const noise = Math.random() * 0.8;
    points.push({ date, count: Math.max(0, Math.round(base + noise)) });
  }

  return points;
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  result.setDate(result.getDate() - result.getDay());
  return result;
}

// 集計単位ごとの「どの期間にまとめるか」を表す文字列キーを作る
function periodKey(date: Date, unit: Granularity): string {
  if (unit === 'day') return date.toISOString().slice(0, 10);
  if (unit === 'week') return startOfWeek(date).toISOString().slice(0, 10);
  return date.toISOString().slice(0, 7); // month: YYYY-MM
}

function aggregate(
  daily: { date: Date; count: number }[],
  range: PeriodRange,
  unit: Granularity,
): CommitTimeseriesPoint[] {
  const filtered = daily.filter(
    (point) => point.date >= range.from && point.date <= range.to,
  );
  const totals = new Map<string, number>();

  for (const point of filtered) {
    const key = periodKey(point.date, unit);
    totals.set(key, (totals.get(key) ?? 0) + point.count);
  }

  return Array.from(totals.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([period, count]) => ({ period, count }));
}

export function getGithubDetailTimeseriesMock(
  range: PeriodRange,
  unit: Granularity,
  repository?: string,
): CommitTimeseriesPoint[] {
  if (repository) {
    return aggregate(getDailyCommits(repository), range, unit);
  }

  // リポジトリ未指定(すべて合計)の場合は、各リポジトリの日別データを合算してから集計する
  const perRepoDaily = TRACKED_REPOSITORIES.map((repo) => getDailyCommits(repo));
  const combinedDaily =
    perRepoDaily[0]?.map((point, index) => ({
      date: point.date,
      count: perRepoDaily.reduce(
        (sum, series) => sum + (series[index]?.count ?? 0),
        0,
      ),
    })) ?? [];

  return aggregate(combinedDaily, range, unit);
}
