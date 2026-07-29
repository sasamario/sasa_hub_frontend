// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      // .envの NUXT_PUBLIC_API_BASE_URL で上書きされる。ここはデフォルト値(未設定時のフォールバック)
      apiBaseUrl: '',
    },
  },
});
