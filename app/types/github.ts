export interface CommitTimeseriesPoint {
  period: string; // 粒度に応じた期間の開始日(YYYY-MM-DD)
  count: number;
}

export type Granularity = 'day' | 'week' | 'month';
