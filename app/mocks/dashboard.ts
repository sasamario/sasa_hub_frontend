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

export function getCommitsTimeseriesMock(): CommitTimeseriesPoint[] {
  // 直近1年ぶんの週別データを機械的に生成する(グラフ描画の確認用)
  const weeks = 52;
  const today = new Date();
  const points: CommitTimeseriesPoint[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 7);
    const period = date.toISOString().slice(0, 10);
    // それらしく波打つ数値(完全ランダムだと荒れすぎるため緩やかに変動させる)
    const base = 15 + Math.sin(i / 4) * 8;
    const noise = Math.random() * 6;
    points.push({ period, count: Math.max(0, Math.round(base + noise)) });
  }

  return points;
}

export function getCommitsByRepositoryMock(): CommitsByRepository[] {
  return [
    { repository: 'sasa_tools', count: 578 },
    { repository: 'sasa_hub_frontend', count: 334 },
    { repository: 'sasa_hub_backend', count: 218 },
    { repository: 'public-learning-repository', count: 154 },
  ];
}
