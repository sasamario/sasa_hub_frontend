export default defineNuxtPlugin(() => {
  // useRuntimeConfigは、環境変数などの設定値をアプリ内から安全に取得、管理するための関数
  const config = useRuntimeConfig();

  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    onResponseError({ response }) {
      console.error('[API Error]', response.status, response._data);
    },
  });

  return {
    // provideはアプリ全体からアクセスできるように登録するNuxtの仕組み
    // ここではfetchのインスタンスをapiという名前で登録している
    provide: { api },
  };
});
