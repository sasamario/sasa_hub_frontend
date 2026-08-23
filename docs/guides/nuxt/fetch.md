# `$fetch`(APIリクエストの共通関数)

NuxtにはHTTP通信を行うための`$fetch`という関数が標準搭載されている(内部的には`ofetch`
というライブラリ)。`import`不要で、どこからでもそのまま使える(自動インポート)。

## 基本形

```ts
const data = await $fetch('/api/github/summary');
```

- 標準の`fetch`と違い、レスポンスボディを**自動でパース**してくれる
  (`await response.json()`のような一手間が不要)。
- エラー時(4xx/5xx)は自動的に例外(throw)になる(標準の`fetch`はエラーでも
  例外を投げず、自分で`response.ok`をチェックする必要がある)。

## `$fetch.create()`(設定済みインスタンスを作る)

毎回`baseURL`やエラー処理を書くのは大変なので、あらかじめ設定を固定した
「専用インスタンス」を作れる。

```ts
const api = $fetch.create({
  baseURL: 'http://localhost:3001',
  onResponseError({ response }) {
    console.error('[API Error]', response.status, response._data);
  },
});

// 以降、baseURLを省略して呼べる
api('/api/github/summary');
```

- `onResponseError`: レスポンスがエラー(4xx/5xxなど)だった時に呼ばれるフック。
  - 中身が同期処理(`console.error`など)だけなら`async`は不要。`await`したい
    非同期処理がある場合のみ`async`を付ける。

参考: [レシピ：カスタム$fetchインスタンス](https://nuxt.com/docs/4.x/guide/recipes/custom-usefetch#recipe-custom-fetch-instance)

### `response`オブジェクトの構成

標準の`Response`(Fetch API)を拡張したオブジェクト。主なプロパティ:

| プロパティ            | 内容                                                                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `response.status`     | HTTPステータスコード(例: `404`, `500`)                                                                                                         |
| `response.statusText` | ステータスの文字列(例: `Not Found`)                                                                                                            |
| `response.ok`         | 2xx系(成功)なら`true`                                                                                                                          |
| `response.headers`    | レスポンスヘッダー                                                                                                                             |
| `response.url`        | リクエスト先のURL                                                                                                                              |
| `response._data`      | **レスポンスボディの中身(パース済み)**。標準の`fetch`では`await response.json()`が別途必要だが、ofetchはあらかじめパースして入れておいてくれる |

`_data`の先頭の`_`は「内部的な扱いのプロパティ」を示す一般的な命名慣習だが、
ofetchでは公式にドキュメント化されたアクセス方法なので、そのまま使ってよい。

### 通常の呼び出しでは`_data`を経由しない

`_data`が出てくるのは`onResponseError`/`onResponse`のような**フックの中だけ**。
通常の呼び出しでは、`$fetch`の**戻り値そのものがすでにパース済みのレスポンスボディ**になる。

```ts
const result = await $api('/api/github/commits/timeseries', {
  params: { from, to, unit },
});
// バックエンドが { "data": [...] } という形で返す場合、
// result は そのまま { data: [...] } になる
result.data; // ← これで配列にアクセスできる(result._data.data ではない)
```

| 状況 | パース済みボディへのアクセス方法 |
|---|---|
| 通常の呼び出し(`await $api(...)`) | 戻り値が**そのまま**パース済みボディ。`result.data`のように直接アクセス |
| `onResponse`/`onResponseError`などのフック内 | `response._data`経由でアクセス |

## 今回のプロジェクトでの使い方

`app/plugins/api.ts`で、`useRuntimeConfig()`から取得した`apiBaseUrl`を
`baseURL`にした`$api`インスタンスを作り、`provide`でアプリ全体から
使えるようにしている(`provide`の詳細は[plugins.md](./plugins.md)参照)。
