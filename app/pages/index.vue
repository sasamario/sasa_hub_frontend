<script setup lang="ts">
import { DEFAULT_PERIOD_PRESET, resolvePeriodRange } from '~/utils/period';
import { getGithubSummaryMock, getQiitaSummaryMock } from '~/mocks/dashboard';

const periodPreset = ref(DEFAULT_PERIOD_PRESET);
const periodRange = computed(() => resolvePeriodRange(periodPreset.value));

const isSyncing = ref(false);

async function onSyncClick() {
  isSyncing.value = true;
  // モック: バックエンド未実装のため、同期処理が動いているように見せるだけの仮実装
  await new Promise((resolve) => setTimeout(resolve, 1500));
  isSyncing.value = false;
}

const githubSummary = getGithubSummaryMock();
const qiitaSummary = getQiitaSummaryMock();
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

    <div class="cards">
      <SummaryCard
        title="GitHub"
        to="/github"
        :metrics="[
          { label: 'コミット総数', value: githubSummary.commitCount },
          { label: 'PR総数', value: githubSummary.prCount },
        ]"
      />
      <SummaryCard
        title="Qiita"
        :metrics="[
          { label: '記事数', value: qiitaSummary.articleCount },
          { label: '合計view', value: qiitaSummary.totalViews },
          { label: '合計LGTM', value: qiitaSummary.totalLikes },
        ]"
      />
    </div>

    <ClientOnly>
      <CommitTrendChart />
      <RepositoryPieChart />
    </ClientOnly>
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
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}
</style>
