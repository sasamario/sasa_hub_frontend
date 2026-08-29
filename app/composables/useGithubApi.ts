import type { CommitTimeseriesPoint, Granularity } from '~/types/github';

// GitHub関連のAPI呼び出しをまとめる窓口
export function useGithubApi() {
  // app/plugins/api.tsでprovideした共通の$fetchインスタンスを取り出す
  const { $api } = useNuxtApp();

  async function getCommitsTimeseries(
    range: PeriodRange,
    unit: Granularity,
    repository?: string,
  ) {
    const result = await $api<{ data: CommitTimeseriesPoint[] }>(
      '/api/github/commits/timeseries',
      {
        params: {
          ...toPeriodQueryParams(range), // { from, to } (JSTのYYYY-MM-DD文字列)
          unit,
          repository, // repositoryがundefinedの場合、$fetchが自動的にこのキーをクエリから省略してくれる
        },
      },
    );

    return result.data;
  }

  // エラー時の処理はapp/plugins/api.ts(onResponseError)に一元化しているため、
  // ここでは個別にtry/catchしない
  return { getCommitsTimeseries };
}
