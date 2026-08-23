# プラグイン(`defineNuxtPlugin`)

`app/plugins/`ディレクトリに置くファイルの中身の書き方。全体像は
[directory-structure.md](./directory-structure.md)を参照。

## 基本形

```ts
export default defineNuxtPlugin(() => {
  // アプリ起動時に1回だけ実行したい処理
});
```

- `defineNuxtPlugin`はNuxtが提供する関数で、「これはNuxtのプラグインです」とNuxtに
  伝えるための決まった書き方(引数に渡した関数が、アプリ起動時に自動的に1回実行される)。
- 今回の`chart.client.ts`では、Chart.jsの部品を登録する処理をこの中に書いている。

## 引数(`nuxtApp`)で使えるもの

`defineNuxtPlugin`に渡す関数は、引数として`nuxtApp`というオブジェクトを受け取れる
(今回は使っていないが、よく使われるものを紹介)。

```ts
export default defineNuxtPlugin((nuxtApp) => {
  // 例: アプリ全体で使えるグローバルな値・関数を注入する
  nuxtApp.provide('hello', () => console.log('hello'));
  // → コンポーネント側で `const { $hello } = useNuxtApp()` として使える

  // 例: Vue本体のインスタンスにアクセスして app.use(...) する
  // nuxtApp.vueApp.use(SomeVuePlugin);
});
```

## `provide`の書き方(ショートハンド)

`nuxtApp.provide(...)`を直接呼ぶ代わりに、関数の**戻り値**で`provide`を指定する
書き方もできる(中身は同じだが、こちらの方が簡潔)。

```ts
export default defineNuxtPlugin(() => {
  const api = $fetch.create({ baseURL: '...' });

  return {
    provide: { api }, // nuxtApp.provide('api', api) と同じ意味
  };
});
```

- `provide: { api }`の`api`という**キー名**が、実際に使う時の名前(`$api`)になる
  (Nuxtが自動で先頭に`$`を付ける)。
- 使う側:
  ```ts
  const { $api } = useNuxtApp();
  $api('/api/github/summary');
  ```

今回の`app/plugins/api.ts`(共通APIクライアント)でこの書き方を使っている。
`$fetch`/`$fetch.create`自体の詳細は[fetch.md](./fetch.md)を参照。

## ファイル名による実行タイミングの制御(再掲)

- `foo.ts`: サーバー・クライアント両方で実行
- `foo.client.ts`: クライアント(ブラウザ)側のみで実行
- `foo.server.ts`: サーバー側のみで実行

Chart.jsはブラウザの`<canvas>`前提のライブラリのため、`chart.client.ts`のように
クライアント限定にしている。ただし`.client.ts`にしても、**そのコンポーネントを
使う側でSSR自体を回避する対応(`<ClientOnly>`)も別途必要**になる場合がある。
詳細: [client-only.md](./client-only.md)。

## 新規追加時の注意

`plugins/`配下に新しいファイルを追加した直後は、開発サーバーの再起動が必要になることがある
(詳細: [directory-structure.md](./directory-structure.md)の該当項目)。
