<script setup lang="ts">
import { Line } from 'vue-chartjs';
import { TRACKED_REPOSITORIES } from '~/mocks/dashboard';
import type { PeriodRange } from '~/utils/period';

const props = defineProps<{
  periodRange: PeriodRange;
}>();

// セレクトボックスの「すべて(合計)」を表す特別な値。
// この値が選ばれた時だけundefinedに変換して渡す(下のtimeseries参照)。
const ALL_REPOSITORIES = 'all';

const repositoryOptions = [
  { value: ALL_REPOSITORIES, label: 'すべて(合計)' },
  ...TRACKED_REPOSITORIES.map((repo) => ({
    value: repo,
    label: getRepositoryShortName(repo),
  })),
];

const selectedRepository = ref<string>(ALL_REPOSITORIES);

const { getCommitsTimeseries } = useGithubApi();

// 選択中のリポジトリ・期間に応じたコミット推移データ。
// selectedRepositoryかperiodRangeが変わるたびに自動で再計算される(watch)。
const { data: timeseries, refresh } = useAsyncData(
  'dashboard-commit-timeseries',
  () =>
    getCommitsTimeseries(
      props.periodRange,
      'week',
      selectedRepository.value === ALL_REPOSITORIES
        ? undefined
        : selectedRepository.value,
    ),
  {
    watch: [() => props.periodRange, selectedRepository],
    default: () => [],
    immediate: false, // 自動実行はオフにする
  },
);

// onMountedは、コンポーネントがブラウザ上のDOMに描画（マウント）された後に実行されるライフサイクルフック
// 描画直後に'dashboard-commit-timeseries'を実行
onMounted(() => {
  refresh(); // 画面表示時に明示的に実行
});

// vue-chartjsの<Line>コンポーネントに渡すデータ形式(Chart.jsの仕様に合わせた形)。
// labels: X軸に並べるラベル(週の開始日)、datasets: 実際にプロットする数値列。
const chartData = computed(() => ({
  labels: timeseries.value.map((point) => point.period),
  datasets: [
    {
      label: 'コミット数',
      data: timeseries.value.map((point) => point.count),
      borderColor: '#378ADD',
      backgroundColor: '#378ADD',
      tension: 0.3, // 線を直線ではなく緩やかな曲線にする度合い(0で直線)
    },
  ],
}));

const chartOptions = {
  responsive: true, // 親要素の幅に合わせて自動リサイズする
  plugins: {
    // データ系列が1本しかなく凡例が無くても分かりやすいため非表示にする
    legend: { display: false },
  },
  // Chart.jsの目盛り・グリッド線はデフォルトが濃い色のため、
  // ダークテーマの背景に合わせて明るい色を明示的に指定する
  scales: {
    x: {
      ticks: { color: '#71717a' },
      grid: { color: '#2a2a2e' },
    },
    y: {
      ticks: { color: '#71717a' },
      grid: { color: '#2a2a2e' },
    },
  },
};
</script>

<template>
  <div class="panel">
    <div class="panel-head">
      <span class="panel-title">コミット推移(週別)</span>
      <select v-model="selectedRepository">
        <option
          v-for="option in repositoryOptions"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </div>
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped>
.panel {
  background: var(--surface-2);
  border: 0.5px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 20px;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.panel-title {
  font-weight: 500;
  font-size: 15px;
}
</style>
