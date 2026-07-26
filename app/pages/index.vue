<script setup lang="ts">
import { DEFAULT_PERIOD_PRESET, resolvePeriodRange } from '~/utils/period';

const periodPreset = ref(DEFAULT_PERIOD_PRESET);
const periodRange = computed(() => resolvePeriodRange(periodPreset.value));
</script>

<template>
  <div>
    <h1>ダッシュボード</h1>
    <PeriodSelector v-model="periodPreset" />
    <p>
      {{ periodRange.from.toLocaleDateString() }} 〜
      {{ periodRange.to.toLocaleDateString() }}
    </p>
  </div>
</template>
