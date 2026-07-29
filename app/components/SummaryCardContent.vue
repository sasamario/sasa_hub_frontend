<script setup lang="ts">
interface Metric {
  label: string;
  value: string | number;
}

defineProps<{
  title: string;
  metrics: Metric[];
  showArrow?: boolean;
}>();
</script>

<template>
  <div class="summary-card__head">
    <span class="summary-card__title">{{ title }}</span>
    <span v-if="showArrow" class="summary-card__arrow">→</span>
  </div>
  <div class="summary-card__metrics">
    <div
      v-for="metric in metrics"
      :key="metric.label"
      class="summary-card__metric"
    >
      <div class="summary-card__metric-label">{{ metric.label }}</div>
      <div class="summary-card__metric-value">{{ metric.value }}</div>
    </div>
  </div>
</template>

<style scoped>
.summary-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.summary-card__title {
  font-weight: 500;
  font-size: 15px;
}
.summary-card__arrow {
  color: var(--text-muted);
}
.summary-card__metrics {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.summary-card__metric-label {
  font-size: 13px;
  color: var(--text-secondary);
}
.summary-card__metric-value {
  font-size: 22px;
  font-weight: 500;
}
</style>
