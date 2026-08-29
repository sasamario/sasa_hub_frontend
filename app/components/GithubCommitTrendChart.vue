<script setup lang="ts">
import { Line } from 'vue-chartjs';
import {
  getGithubDetailTimeseriesMock,
  type Granularity,
} from '~/mocks/githubDetail';
import { TRACKED_REPOSITORIES } from '~/mocks/dashboard';
import type { PeriodRange } from '~/utils/period';

const props = defineProps<{
  periodRange: PeriodRange;
}>();

// グラフの粒度を選択するためのボタン
const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: 'day', label: '日' },
  { value: 'week', label: '週' },
  { value: 'month', label: '月' },
];
// 表示粒度
const granularity = ref<Granularity>('week');

// リポジトリを選択するためのセレクトボックス
const ALL_REPOSITORIES = 'all';
const repositoryOptions = [
  { value: ALL_REPOSITORIES, label: 'すべて(合計)' },
  ...TRACKED_REPOSITORIES.map((repo) => ({
    value: repo,
    label: getRepositoryShortName(repo),
  })),
];
// 表示リポジトリ
const selectedRepository = ref<string>(ALL_REPOSITORIES);

// グラフのデータを取得する（表示期間、表裏粒度、表示リポジトリが変更したら再取得）
// refで定義した値をcomputedで監視することで、値が変更されたら自動的に再計算される
const timeseries = computed(() =>
  getGithubDetailTimeseriesMock(
    props.periodRange,
    granularity.value,
    selectedRepository.value === ALL_REPOSITORIES
      ? undefined
      : selectedRepository.value,
  ),
);

// グラフのデータとオプションを作成する
const chartData = computed(() => ({
  labels: timeseries.value.map((point) => point.period),
  datasets: [
    {
      label: 'コミット数',
      data: timeseries.value.map((point) => point.count),
      borderColor: '#378ADD',
      backgroundColor: '#378ADD',
      tension: 0.3,
    },
  ],
}));

// グラフのオプションを作成する
const chartOptions = {
  responsive: true,
  plugins: {
    legend: { display: false },
  },
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
      <span class="panel-title">コミット推移</span>
      <div class="controls">
        <div class="toggle">
          <button
            v-for="option in GRANULARITY_OPTIONS"
            :key="option.value"
            type="button"
            :class="{ on: granularity === option.value }"
            @click="granularity = option.value"
          >
            {{ option.label }}
          </button>
        </div>
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
.controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.toggle {
  display: inline-flex;
  border: 0.5px solid var(--border-strong);
  border-radius: var(--radius);
  overflow: hidden;
}
.toggle button {
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--text-secondary);
  padding: 4px 12px;
}
.toggle button.on {
  background: var(--bg-accent);
  color: var(--text-accent);
}
</style>
