<script setup lang="ts">
import {
  getGithubActivitiesMock,
  type ActivityType,
  type GithubActivity,
} from '~/mocks/githubActivities';
import { TRACKED_REPOSITORIES } from '~/mocks/dashboard';
import type { PeriodRange } from '~/utils/period';

const props = defineProps<{
  periodRange: PeriodRange;
}>();

const ALL_REPOSITORIES = 'all';
const repositoryOptions = [
  { value: ALL_REPOSITORIES, label: '全リポジトリ' },
  ...TRACKED_REPOSITORIES.map((repo) => ({
    value: repo,
    label: getRepositoryShortName(repo),
  })),
];
// 表示リポジトリ
const selectedRepository = ref<string>(ALL_REPOSITORIES);

// 表示種別（コミット、PR）
const ALL_TYPES = 'all';
const typeOptions: { value: string; label: string }[] = [
  { value: ALL_TYPES, label: 'すべての種別' },
  { value: 'commit', label: 'コミット' },
  { value: 'pull_request', label: 'PR' },
];
const selectedType = ref<string>(ALL_TYPES);

// 活動一覧の表示データ
const items = ref<GithubActivity[]>([]);
// 活動一覧のページング用カーソル
const cursor = ref<string | null>(null);

function fetchPage(reset: boolean) {
  const result = getGithubActivitiesMock({
    range: props.periodRange,
    repository:
      selectedRepository.value === ALL_REPOSITORIES
        ? undefined
        : selectedRepository.value,
    type:
      selectedType.value === ALL_TYPES
        ? undefined
        : (selectedType.value as ActivityType),
    // データ取得時にカーソルを指定することで、次のページのデータを取得できる
    cursor: reset ? null : cursor.value,
  });

  items.value = reset ? result.items : [...items.value, ...result.items];
  // 取得したデータの最後の位置をカーソルとして保持することで、次のページのデータを取得できる
  cursor.value = result.nextCursor;
}

// 期間・フィルタが変わったら、ページングをリセットして最初から読み込み直す
// 検索条件が変わったら、fetchPage>(true)で呼び出して、1ページ目から再取得する
// immediate: trueにすることで、初回マウント時にもfetchPage>(true)が呼び出される（指定しないと、初期値が設定されないため）
watch(
  [() => props.periodRange, selectedRepository, selectedType],
  () => fetchPage(true),
  { immediate: true },
);

// 「さらに読み込む」ボタンがクリックされたら、次のページを取得する
function onLoadMoreClick() {
  fetchPage(false);
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
</script>

<template>
  <div class="panel">
    <div class="panel-head">
      <span class="panel-title">活動一覧</span>
      <div class="filters">
        <select v-model="selectedRepository">
          <option
            v-for="option in repositoryOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
        <select v-model="selectedType">
          <option
            v-for="option in typeOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <div class="row-head">
      <span class="r-date">日付</span>
      <span class="badge">種別</span>
      <span class="r-repo">リポジトリ</span>
      <span class="r-title">概要</span>
      <span class="r-ext"></span>
    </div>

    <a
      v-for="activity in items"
      :key="activity.id"
      class="row"
      :href="activity.url"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class="r-date">{{ formatDate(activity.activityDate) }}</span>
      <span
        class="badge"
        :class="activity.type === 'pull_request' ? 'pr' : 'commit'"
      >
        {{
          activity.type === 'pull_request'
            ? `PR #${activity.externalId}`
            : 'commit'
        }}
      </span>
      <span class="r-repo">{{
        getRepositoryShortName(activity.repository)
      }}</span>
      <span class="r-title">{{ activity.title }}</span>
      <span class="r-ext">↗</span>
    </a>

    <div v-if="cursor" class="more">
      <button type="button" @click="onLoadMoreClick">さらに読み込む</button>
    </div>
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
.filters {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 4px;
  border-bottom: 0.5px solid var(--border);
  text-decoration: none;
  color: inherit;
}
.row-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 4px 8px;
  font-size: 11px;
  color: var(--text-muted);
  border-bottom: 0.5px solid var(--border-strong);
}
.r-date {
  font-size: 12px;
  color: var(--text-muted);
  width: 82px;
  flex-shrink: 0;
  text-align: center;
}
.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  flex-shrink: 0;
  width: 70px;
  text-align: center;
}
.badge.commit {
  background: rgba(55, 138, 221, 0.18);
  color: #7fb2ee;
}
.badge.pr {
  background: rgba(29, 158, 117, 0.18);
  color: #6fd6ae;
}
.r-repo {
  font-size: 12px;
  color: var(--text-secondary);
  width: 170px;
  flex-shrink: 0;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.r-title {
  font-size: 13px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.r-ext {
  font-size: 15px;
  color: var(--text-muted);
  flex-shrink: 0;
}
.more {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}
</style>
