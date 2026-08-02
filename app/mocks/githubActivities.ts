// GitHub活動一覧(コミット/PR)用のモックデータ。
// architecture.md 6.3のカーソル方式(activity_date + idの組み合わせ)に沿った形にしている。
import { TRACKED_REPOSITORIES } from './dashboard';
import type { PeriodRange } from '~/utils/period';

export type ActivityType = 'commit' | 'pull_request';

export interface GithubActivity {
  id: number;
  type: ActivityType;
  repository: string;
  title: string;
  url: string;
  activityDate: Date;
  externalId: string;
}

const COMMIT_TITLES = [
  'ログイン機能のバリデーション追加',
  'フォームのスタイル調整',
  'READMEを更新',
  'APIレスポンスの型定義を整理',
  'テストケースを追加',
  '依存パッケージを更新',
  'バグ修正: 日付表示のずれを解消',
  'リファクタリング: 重複コードを削除',
];

const PR_TITLES = [
  'APIレスポンスの型定義を整理',
  'ログイン画面のリファクタリング',
  'CI設定の見直し',
  'エラーハンドリングの統一',
];

function hashString(value: string): number {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) % 1000;
  }
  return hash;
}

// 400日分、複数リポジトリにわたって活動データを生成する(モック用の固定リスト。
// 毎回ランダムだと「さらに読み込む」の動作確認がしづらいため、モジュール読み込み時に1回だけ生成する)
function generateActivities(): GithubActivity[] {
  const activities: GithubActivity[] = [];
  const today = new Date();
  let id = 1;

  for (const repository of TRACKED_REPOSITORIES) {
    const seed = hashString(repository);

    for (let dayOffset = 0; dayOffset < 400; dayOffset++) {
      // 毎日発生するわけではないので、日ごとに発生確率を持たせる
      const chance = (Math.sin(dayOffset / 6 + seed) + 1) / 2; // 0〜1
      if (chance < 0.6) continue;

      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);

      const isPr = (dayOffset + seed) % 5 === 0;
      const type: ActivityType = isPr ? 'pull_request' : 'commit';
      const titles = isPr ? PR_TITLES : COMMIT_TITLES;
      const title = titles[(dayOffset + seed) % titles.length] ?? '';

      activities.push({
        id: id++,
        type,
        repository,
        title,
        url: `https://github.com/example/${repository}`,
        activityDate: date,
        externalId: isPr ? `${100 + id}` : `${seed}${dayOffset}`,
      });
    }
  }

  // 新しい順にソート(activity_date降順。同値の場合に備えてidも降順にし、順序を一意に定める)
  return activities.sort((a, b) => {
    const dateDiff = b.activityDate.getTime() - a.activityDate.getTime();
    return dateDiff !== 0 ? dateDiff : b.id - a.id;
  });
}

const ALL_ACTIVITIES = generateActivities();

export interface GithubActivitiesQuery {
  range: PeriodRange;
  repository?: string;
  type?: ActivityType;
  cursor?: string | null;
  limit?: number;
}

export interface GithubActivitiesResult {
  items: GithubActivity[];
  nextCursor: string | null;
}

// カーソル文字列 = activity_date と id を組み合わせた「並び順上の位置」を表す値
function encodeCursor(activity: GithubActivity): string {
  return `${activity.activityDate.toISOString()}_${activity.id}`;
}

function decodeCursor(cursor: string): { date: Date; id: number } {
  const [isoDate, idStr] = cursor.split('_');
  return { date: new Date(isoDate ?? ''), id: Number(idStr) };
}

export function getGithubActivitiesMock({
  range,
  repository,
  type,
  cursor,
  limit = 20,
}: GithubActivitiesQuery): GithubActivitiesResult {
  let filtered = ALL_ACTIVITIES.filter(
    (activity) =>
      activity.activityDate >= range.from && activity.activityDate <= range.to,
  );
  if (repository) {
    filtered = filtered.filter((activity) => activity.repository === repository);
  }
  if (type) {
    filtered = filtered.filter((activity) => activity.type === type);
  }

  // cursorは「前回最後に返したデータ」を指す目印であり、「次の開始位置そのもの」ではない。
  // そのため、まずcursorが指すデータを一覧の中から探し出し(findIndex)、
  // 見つかった位置+1を実際の開始位置(startIndex)とする。
  let startIndex = 0;
  if (cursor) {
    const { date, id } = decodeCursor(cursor);
    const foundIndex = filtered.findIndex(
      (activity) =>
        activity.activityDate.getTime() === date.getTime() && activity.id === id,
    );
    startIndex = foundIndex === -1 ? 0 : foundIndex + 1;
  }

  const items = filtered.slice(startIndex, startIndex + limit);
  // まだ後ろにデータが残っているか(今回返した範囲の後ろにまだ要素があるか)
  const hasMore = startIndex + limit < filtered.length;
  // nextCursorは「今回のページで最後に返したデータ」を目印化したもの。
  // 次回の呼び出し時に、この目印を手がかりに上のstartIndex計算をやり直す。
  const lastItem = items[items.length - 1];
  const nextCursor = hasMore && lastItem ? encodeCursor(lastItem) : null;

  return { items, nextCursor };
}
