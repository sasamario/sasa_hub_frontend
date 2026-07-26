<script setup lang="ts">
import { Doughnut } from 'vue-chartjs';
import { getCommitsByRepositoryMock } from '~/mocks/dashboard';

const byRepository = getCommitsByRepositoryMock();

const COLORS = ['#378ADD', '#1D9E75', '#D85A30', '#7F77DD'];

const chartData = computed(() => ({
  labels: byRepository.map((item) => item.repository),
  datasets: [
    {
      data: byRepository.map((item) => item.count),
      backgroundColor: COLORS,
    },
  ],
}));

const totalCount = computed(() =>
  byRepository.reduce((sum, item) => sum + item.count, 0),
);

// 割合(%)の表示用。0件のリポジトリは0%として自然に表示される(凡例からは除外しない)
function percentage(count: number): number {
  if (totalCount.value === 0) return 0;
  return Math.round((count / totalCount.value) * 100);
}

const chartOptions = {
  responsive: true,
  plugins: {
    // 独自の凡例(右側にリポジトリ名+割合)を表示するため、Chart.js標準の凡例は使わない
    legend: { display: false },
  },
};
</script>

<template>
  <div class="panel">
    <div class="panel-title">リポジトリ別コミット数の割合</div>
    <div class="content">
      <div class="chart-wrapper">
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>
      <ul class="legend">
        <li v-for="(item, index) in byRepository" :key="item.repository">
          <span class="swatch" :style="{ background: COLORS[index] }" />
          {{ item.repository }}　{{ percentage(item.count) }}%
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.panel {
  border: 1px solid #e2e2e0;
  border-radius: 12px;
  padding: 16px 20px;
}
.panel-title {
  font-weight: 500;
  font-size: 15px;
  margin-bottom: 12px;
}
.content {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}
.chart-wrapper {
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}
.legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}
.swatch {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-right: 6px;
  vertical-align: middle;
}
</style>
