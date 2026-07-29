<script setup lang="ts">
interface Metric {
  label: string;
  value: string | number;
}

defineProps<{
  title: string;
  metrics: Metric[];
  to?: string;
}>();
</script>

<template>
  <NuxtLink v-if="to" :to="to" class="summary-card">
    <SummaryCardContent :title="title" :metrics="metrics" show-arrow />
  </NuxtLink>
  <div v-else class="summary-card">
    <SummaryCardContent :title="title" :metrics="metrics" />
  </div>
</template>

<style scoped>
.summary-card {
  display: block;
  background: var(--surface-2);
  border: 0.5px solid var(--border);
  border-radius: var(--radius);
  padding: 16px 20px;
  text-decoration: none;
  color: inherit;
}
</style>
