# `useAsyncData`(データ取得の共通処理)

Nuxt標準の「データ取得+リアクティブな反映」をまとめて面倒を見てくれるcomposable。

## 基本形

```ts
const { data, pending, error, refresh } = useAsyncData(
  'キー(一意な文字列)',
  () => 実際にデータを取得する非同期関数,
  {
    watch: [監視したい値の配列], // このどれかが変わると自動で再取得
    default: () => 初期値,       // データ取得前・失敗時のデフォルト値
  },
);
```

- **第1引数(キー)**: このデータ取得を識別する一意な文字列。同じページ内で複数の
  `useAsyncData`を使う場合、名前が被らないようにする。
- **第2引数**: 実際にAPIを呼ぶ処理(関数)。
- **`watch`オプション**: 指定した値が変わるたびに自動で再取得してくれる。
- **`default`オプション**: まだ取得できていない時・失敗時に使うフォールバック値。
  これが無いと、取得前は`data.value`が`null`になり、テンプレート側で毎回`null`
  チェックが必要になる。
- **戻り値の`refresh`**: 手動で再取得したい時に呼べる関数。

## 既知の問題: `<ClientOnly>`と組み合わせた時、初回の自動実行が動かないことがある

`useAsyncData`は本来、コンポーネントが作られた時点で**自動的に1回実行**される
(`immediate: true`がデフォルト)。これはVueの`<Suspense>`という仕組みと連携した
挙動だが、`<ClientOnly>`は`<Suspense>`と連携していないため、この組み合わせでは
**初回の自動実行がうまくトリガーされない**ことがある(実際に本プロジェクトで遭遇)。

- `lazy: true`を試したが解消しなかった。
- 原因の完全な特定はできなかったが、実用上は下記の対応で解決した。

### 対応: `immediate: false` + `onMounted`で明示的に実行する

「自動実行に頼る」のをやめ、**画面表示時に明示的に実行する**ように書き換える。

```ts
const { data, refresh } = useAsyncData(
  'commit-timeseries',
  () => getCommitsTimeseries(...),
  {
    watch: [() => props.periodRange, selectedRepository],
    default: () => [],
    immediate: false, // 自動実行はオフにする
  },
);

onMounted(() => {
  refresh(); // 画面表示時に明示的に実行
});
```

- `immediate: false`: `useAsyncData`側の自動初回実行をオフにする。
- `onMounted(...)`: コンポーネントが実際に画面に表示された直後に、指定した処理を
  実行するVueの仕組み(Composition APIの1つ。importなしでそのまま使える)。
  ここで`refresh()`を呼ぶことで、初回実行を確実に行う。
- `watch`はそのまま残しているので、期間・フィルタなど値の変更時の再取得は
  今まで通り自動で動く。

**教訓**: `<ClientOnly>`配下では、`useAsyncData`の「自動初回実行」を信用せず、
`onMounted` + `refresh()`で明示的にトリガーする方が確実。
