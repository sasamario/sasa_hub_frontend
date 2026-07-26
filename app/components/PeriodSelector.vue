<script setup lang="ts">
import { PERIOD_OPTIONS, type PeriodPreset } from '~/utils/period';

defineProps<{
  modelValue: PeriodPreset;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: PeriodPreset];
}>();

function onChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as PeriodPreset;
  emit('update:modelValue', value);
}
</script>

<template>
  <div class="period-selector">
    <span class="period-selector__label">期間</span>
    <select :value="modelValue" @change="onChange">
      <option
        v-for="option in PERIOD_OPTIONS"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.period-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}
.period-selector__label {
  font-size: 13px;
  color: #55554f;
}
</style>
