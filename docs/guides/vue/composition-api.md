# Composition API(`ref` / `computed`)

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
