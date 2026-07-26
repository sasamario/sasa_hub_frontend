<script setup lang="ts">
import { DEFAULT_PERIOD_PRESET, resolvePeriodRange } from '~/utils/period';
import { getGithubSummaryMock, getQiitaSummaryMock } from '~/mocks/dashboard';

const periodPreset = ref(DEFAULT_PERIOD_PRESET);
const periodRange = computed(() => resolvePeriodRange(periodPreset.value));

// GitHub/Qiitaそれぞれ独立した同期ボタンのため、状態も個別に持つ
function createSyncHandler() {
  const isSyncing = ref(false);
  async function sync() {
    isSyncing.value = true;
    // モック: バックエンド未実装のため、同期処理が動いているように見せるだけの仮実装
    await new Promise((resolve) => setTimeout(resolve, 1500));
    isSyncing.value = false;
  }
  return { isSyncing, sync };
}

const githubSync = createSyncHandler();
const qiitaSync = createSyncHandler();

// periodRangeが変わるたびに自動で再計算される
const githubSummary = computed(() => getGithubSummaryMock(periodRange.value));
// Qiitaは最新値のみを保持する設計のため、期間セレクタとは連動させず常に全期間の値
const qiitaSummary = getQiitaSummaryMock();
</script>

<template>
  <div>
    <h1>ダッシュボード</h1>

    <section class="source-section">
      <h2 class="section-title">GitHub</h2>

      <div class="toolbar">
        <PeriodSelector v-model="periodPreset" />
        <button :disabled="githubSync.isSyncing.value" @click="githubSync.sync">
          {{ githubSync.isSyncing.value ? '同期中…' : '↻ GitHub同期' }}
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
        <ClientOnly>
          <RepositoryPieChart :period-range="periodRange" />
        </ClientOnly>
      </div>

      <ClientOnly>
        <CommitTrendChart :period-range="periodRange" />
      </ClientOnly>
    </section>

    <section class="source-section">
      <h2 class="section-title">Qiita</h2>

      <div class="toolbar">
        <span class="hint">期間セレクタとは連動せず、常に全期間の値を表示</span>
        <button :disabled="qiitaSync.isSyncing.value" @click="qiitaSync.sync">
          {{ qiitaSync.isSyncing.value ? '同期中…' : '↻ Qiita同期' }}
        </button>
      </div>

      <div class="cards">
        <SummaryCard
          title="Qiita"
          :metrics="[
            { label: '記事数', value: qiitaSummary.articleCount },
            { label: '合計view', value: qiitaSummary.totalViews },
            { label: '合計LGTM', value: qiitaSummary.totalLikes },
          ]"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.source-section {
  margin-bottom: 28px;
}
.section-title {
  font-size: 16px;
  margin-bottom: 12px;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.hint {
  font-size: 12px;
  color: #8a8a82;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
</style>
