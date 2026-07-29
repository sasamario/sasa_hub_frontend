// ダッシュボード画面用のモックデータ。
// バックエンドのAPIレスポンス形式はまだ未確定のため、暫定の形で用意している。
// フェーズ5で本物のAPI呼び出しに差し替える際、関数名・形を見直す想定。
import type { PeriodRange } from '~/utils/period';

export const TRACKED_REPOSITORIES = [
  'sasa_tools',
  'sasa_hub_frontend',
  'sasa_hub_backend',
  'public-learning-repository',
] as const;

export interface GithubSummary {
  commitCount: number;
  prCount: number;
}

export interface QiitaSummary {
  articleCount: number;
  totalViews: number;
  totalLikes: number;
}

export interface CommitTimeseriesPoint {
  period: string; // 週の開始日(YYYY-MM-DD)
  count: number;
}

export interface CommitsByRepository {
  repository: string;
  count: number;
}

// 選択期間の長さ(日数)を1年基準の割合(0〜1)に変換する。
// モックなので「期間が短いほど数値も比例して小さくなる」という単純な近似で表現している。
function periodScaleFactor(range: PeriodRange): number {
  const days =
    (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24);
  return Math.min(1, Math.max(0, days / 365));
}

export function getGithubSummaryMock(range: PeriodRange): GithubSummary {
  const factor = periodScaleFactor(range);
  return {
    commitCount: Math.round(1284 * factor),
    prCount: Math.round(86 * factor),
  };
}

// Qiitaは最新値のみを保持する設計(architecture.md 4.2)のため、
// ダッシュボードの期間セレクタとは連動させず、常に全期間の値を返す。
export function getQiitaSummaryMock(): QiitaSummary {
  return {
    articleCount: 18,
    totalViews: 42910,
    totalLikes: 356,
  };
}

// リポジトリ名から簡易的な数値を作る(同じリポジトリなら毎回同じ波形になるようにするため)
function hashString(value: string): number {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) % 1000;
  }
  return hash;
}

function getCommitsTimeseriesForRepository(
  repository: string,
): CommitTimeseriesPoint[] {
  const weeks = 52;
  const today = new Date();
  const seed = hashString(repository);
  const points: CommitTimeseriesPoint[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 7);
    const period = date.toISOString().slice(0, 10);
    // それらしく波打つ数値(リポジトリごとに位相・振幅を変えて、見た目にバリエーションを出す)
    const base = 5 + Math.sin(i / 4 + seed) * (4 + (seed % 5));
    const noise = Math.random() * 3;
    points.push({ period, count: Math.max(0, Math.round(base + noise)) });
  }

  return points;
}

// 全リポジトリの値を週ごとに合算する(「すべて(合計)」表示用)
function getCommitsTimeseriesForAllRepositories(): CommitTimeseriesPoint[] {
  const perRepository = TRACKED_REPOSITORIES.map((repo) =>
    getCommitsTimeseriesForRepository(repo),
  );

  return (
    perRepository[0]?.map((point, index) => ({
      period: point.period,
      count: perRepository.reduce(
        (sum, series) => sum + (series[index]?.count ?? 0),
        0,
      ),
    })) ?? []
  );
}

export function getCommitsTimeseriesMock(
  range: PeriodRange,
  repository?: string,
): CommitTimeseriesPoint[] {
  const points = repository
    ? getCommitsTimeseriesForRepository(repository)
    : getCommitsTimeseriesForAllRepositories();

  // 生成した52週分のうち、選択期間に含まれる週だけに絞り込む
  return points.filter((point) => {
    const date = new Date(point.period);
    return date >= range.from && date <= range.to;
  });
}

export function getCommitsByRepositoryMock(
  range: PeriodRange,
): CommitsByRepository[] {
  // コミット推移グラフと同じ週別データを期間で絞り込んで合計する。
  // リポジトリごとに変動パターンが異なるため、期間を変えると比率も自然に変わる
  // (単純に同じ係数で全体を縮小するだけだと、期間を変えても比率が変わらず
  // 円グラフが連動して見えなくなってしまうため)。
  return TRACKED_REPOSITORIES.map((repository) => {
    const points = getCommitsTimeseriesForRepository(repository).filter(
      (point) => {
        const date = new Date(point.period);
        return date >= range.from && date <= range.to;
      },
    );
    return {
      repository,
      count: points.reduce((sum, point) => sum + point.count, 0),
    };
  });
}
