<template>
  <div class="app-layout">
    <aside class="app-layout__sidebar">
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
  width: 200px;
  border-right: 1px solid #ddd;
  padding: 16px;
}
.app-layout__main {
  flex: 1;
  padding: 16px;
}
.app-layout__nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
/* Nuxtが現在のルートと完全一致するNuxtLinkに自動で付与するクラス */
.app-layout__nav :deep(.router-link-exact-active) {
  font-weight: bold;
  color: #2563eb;
}
</style>
