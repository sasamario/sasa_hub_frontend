<script setup lang="ts">
import { DEFAULT_PERIOD_PRESET, resolvePeriodRange } from '~/utils/period';

const periodPreset = ref(DEFAULT_PERIOD_PRESET);
const periodRange = computed(() => resolvePeriodRange(periodPreset.value));

const isSyncing = ref(false);

async function onSyncClick() {
  isSyncing.value = true;
  // モック: バックエンド未実装のため、同期処理が動いているように見せるだけの仮実装
  await new Promise((resolve) => setTimeout(resolve, 1500));
  isSyncing.value = false;
}
</script>

<template>
  <div>
    <h1>ダッシュボード</h1>
    <div class="toolbar">
      <PeriodSelector v-model="periodPreset" />
      <button :disabled="isSyncing" @click="onSyncClick">
        {{ isSyncing ? '同期中…' : '↻ 同期' }}
      </button>
    </div>
    <p>
      {{ periodRange.from.toLocaleDateString() }} 〜
      {{ periodRange.to.toLocaleDateString() }}
    </p>
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
</style>
