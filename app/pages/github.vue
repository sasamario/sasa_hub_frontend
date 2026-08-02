<script setup lang="ts">
import { DEFAULT_PERIOD_PRESET, resolvePeriodRange } from '~/utils/period';

const periodPreset = ref(DEFAULT_PERIOD_PRESET);
const periodRange = computed(() => resolvePeriodRange(periodPreset.value));
</script>

<template>
  <div>
    <div class="page-head">
      <h1 class="page-title">GitHub詳細</h1>
      <PeriodSelector v-model="periodPreset" />
    </div>

    <div class="chart-wrapper">
      <ClientOnly>
        <GithubCommitTrendChart :period-range="periodRange" />
      </ClientOnly>
    </div>

    <ActivityList :period-range="periodRange" />
  </div>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.page-title {
  font-size: 18px;
  margin: 0;
}
.chart-wrapper {
  margin-bottom: 16px;
}
</style>
