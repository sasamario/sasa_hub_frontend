// 期間セレクタで扱うプリセットの定義と、実際の日付範囲への変換。

export type PeriodPreset = '1y' | '6m' | '3m' | '1m';

export const PERIOD_OPTIONS: { value: PeriodPreset; label: string }[] = [
  { value: '1y', label: '直近1年' },
  { value: '6m', label: '直近6ヶ月' },
  { value: '3m', label: '直近3ヶ月' },
  { value: '1m', label: '直近1ヶ月' },
];

export const DEFAULT_PERIOD_PRESET: PeriodPreset = '1y';

export interface PeriodRange {
  from: Date;
  to: Date;
}

const MONTHS_BY_PRESET: Record<PeriodPreset, number> = {
  '1y': 12,
  '6m': 6,
  '3m': 3,
  '1m': 1,
};

export function resolvePeriodRange(preset: PeriodPreset): PeriodRange {
  const to = new Date();
  const from = new Date(to);
  from.setMonth(from.getMonth() - MONTHS_BY_PRESET[preset]);
  return { from, to };
}
