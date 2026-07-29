<template>
  <div class="app-layout">
    <aside class="app-layout__sidebar">
      <div class="app-layout__brand">学習トラッカー</div>
      <nav class="app-layout__nav">
        <NuxtLink to="/">ダッシュボード</NuxtLink>
        <NuxtLink to="/github">GitHub詳細</NuxtLink>
      </nav>
    </aside>
    <main class="app-layout__main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}
.app-layout__sidebar {
  flex: 0 0 200px;
  background: var(--surface-1);
  border-right: 0.5px solid var(--border);
  padding: 12px 8px;
}
.app-layout__brand {
  font-size: 13px;
  font-weight: 600;
  padding: 6px 10px;
  color: var(--text-secondary);
}
.app-layout__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 8px;
}
.app-layout__nav :deep(a) {
  display: block;
  padding: 8px 10px;
  border-radius: var(--radius);
  color: var(--text-secondary);
  font-size: 14px;
  text-decoration: none;
}
/* Nuxtが現在のルートと完全一致するNuxtLinkに自動で付与するクラス */
.app-layout__nav :deep(.router-link-exact-active) {
  background: var(--bg-accent);
  color: var(--text-accent);
  font-weight: 500;
}
.app-layout__main {
  flex: 1;
  padding: 24px;
}
</style>
