// ダッシュボード画面用のモックデータ。
// バックエンドのAPIレスポンス形式はまだ未確定のため、暫定の形で用意している。
// フェーズ5で本物のAPI呼び出しに差し替える際、関数名・形を見直す想定。

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

export function getGithubSummaryMock(): GithubSummary {
  return {
    commitCount: 1284,
    prCount: 86,
  };
}

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

export function getCommitsTimeseriesMock(
  repository?: string,
): CommitTimeseriesPoint[] {
  if (repository) {
    return getCommitsTimeseriesForRepository(repository);
  }

  // リポジトリ未指定(すべて合計)の場合は、各リポジトリの値を週ごとに合算する
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
    })) || []
  );
}

export function getCommitsByRepositoryMock(): CommitsByRepository[] {
  return [
    { repository: 'sasa_tools', count: 578 },
    { repository: 'sasa_hub_frontend', count: 334 },
    { repository: 'sasa_hub_backend', count: 218 },
    { repository: 'public-learning-repository', count: 154 },
  ];
}
