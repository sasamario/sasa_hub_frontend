# Composition API(`ref` / `computed` / `watch`)

Vueで「値が変わったら画面も自動で更新される」仕組み(リアクティビティ)を作るためのAPI。

## `ref`

値を「監視対象の入れ物」に包む。中の値は `.value` でアクセスする。

```ts
const periodPreset = ref('1y');

periodPreset.value; // 'get' 中身を読む
periodPreset.value = '6m'; // 'set' 中身を書き換える → 画面が自動更新される
```

- `<template>`内では`.value`を書かなくても自動でアンラップされる(Vueの仕様)。
  ```vue
  <template>
    <p>{{ periodPreset }}</p>
    <!-- periodPreset.value ではなく periodPreset と書くだけでよい -->
  </template>
  ```

## `computed`

他のリアクティブな値をもとに、**自動で再計算される値**を作る。

```ts
const periodPreset = ref('1y');
const periodRange = computed(() => resolvePeriodRange(periodPreset.value));
```

- `periodPreset`が変わるたびに、`periodRange`も自動で再計算される。
- `computed`の中で使っている値(この例では`periodPreset.value`)をVueが自動的に検知して、
  依存関係を追跡してくれる(明示的に「これを見て」と指定する必要はない)。
- 読み取り専用(`computed`の結果に直接代入はできない。値を変えたい場合は元になっている
  `ref`側を変更する)。

## `ref` と `computed` の使い分け

- `ref`: 自分で直接書き換える値(ユーザーの入力・選択など)
- `computed`: 他の値から導き出せる値(自分で直接書き換えない。元の値が変われば追従する)

今回のケース: `periodPreset`(選択されたプリセット)は`ref`、
`periodRange`(そこから計算される実際の日付範囲)は`computed`、という役割分担。

## `watch`

指定した値が変わるたびに、**任意の処理(副作用)を実行する**ためのAPI。
`computed`が「値を再計算する」のに対し、`watch`は「値が変わったら何かする」という違いがある。

```ts
watch(
  selectedRepository, // 監視する対象(refを渡す)
  (newValue, oldValue) => {
    console.log(`${oldValue} から ${newValue} に変わった`);
  },
);
```

- 第1引数: 監視する対象。**単体**でも、**配列**で複数まとめて渡すこともできる。
  ```ts
  watch(
    [() => props.periodRange, selectedRepository, selectedType],
    () => fetchPage(true), // どれか1つでも変わればこの関数が実行される
  );
  ```
  - `props.periodRange`のような「propsやcomputedの値」を監視したい場合は、
    `() => props.periodRange`のように**関数で包む**必要がある(refをそのまま
    渡せるのは`ref`自身の場合のみ)。
- 第2引数: 値が変わった時に実行するコールバック関数。

### `computed` との使い分け

- `computed`: 「この値から、あの値を導き出したい」→ **値を返す**。
- `watch`: 「この値が変わったら、何か処理(API呼び出し・ログ出力など)をしたい」→
  **値は返さず、処理を実行するだけ**。

今回のケース(`ActivityList.vue`): 期間やフィルタが変わったら「データの再取得」という
副作用を実行したいため、`computed`ではなく`watch`を使っている。

### `immediate` オプション

```ts
watch(
  [() => props.periodRange, selectedRepository, selectedType],
  () => fetchPage(true),
  { immediate: true },
);
```

- `watch`はデフォルトでは**値が変化した時にしか**コールバックを実行しない
  (登録した直後には実行されない)。
- `immediate: true`を付けると、**登録した直後に1回**コールバックを実行してくれる。
- 今回のケースでは、画面表示直後(まだ何も変化していない時点)にも
  最初のデータ取得を行いたいため、`immediate: true`が必要だった。
  これが無いと、画面を開いた直後は`items`が空のままになってしまう。
