# Props / Emits(親子コンポーネント間のやり取り)

コンポーネントを組み合わせて画面を作る上で欠かせない、親子間のデータのやり取りの仕組み。

## 基本の考え方

- **props**: 親 → 子への一方通行のデータの受け渡し。
- **emit**: 子 → 親への「イベントが起きたよ」という通知。

Vueではデータは基本的に**上から下(親から子)にしか流れない**。子が親のデータを直接書き換える
ことはできない。子が親に何かを伝えたい時は、値を書き換えるのではなく「イベントを発火」して、
親側にその処理を委ねる。

## `defineProps`(親から子への値渡し)

`<script setup>`専用のコンパイラマクロ(importなしで使える)。子コンポーネント側で、
「親からこういう値を受け取る」という定義をする。

```ts
// 子コンポーネント(PeriodSelector.vue)側
defineProps<{
  modelValue: PeriodPreset;
}>();
```

```vue
<!-- 親コンポーネント側 -->
<PeriodSelector :modelValue="periodPreset" />
```

## `defineEmits` / `emit`(子から親への通知)

`defineEmits`で「このコンポーネントはこういうイベントを発火することがある」と定義する。
戻り値として得られる`emit`関数を使って、実際にイベントを発火する。

```ts
// 子コンポーネント側
const emit = defineEmits<{
  'update:modelValue': [value: PeriodPreset];
}>();

function onChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as PeriodPreset;
  emit('update:modelValue', value); // 親に通知
}
```

```vue
<!-- 親コンポーネント側: イベントを受け取る -->
<PeriodSelector
  :modelValue="periodPreset"
  @update:modelValue="(value) => (periodPreset = value)"
/>
```

## `v-model`(props+emitの糖衣構文)

「`modelValue`という名前のpropsを渡す」+「`update:modelValue`イベントを受け取って
値を更新する」という**セットの処理**を、`v-model`と書くだけで実現できる。

```vue
<!-- これは -->
<PeriodSelector v-model="periodPreset" />

<!-- 次のように書いたのと同じ意味になる -->
<PeriodSelector
  :modelValue="periodPreset"
  @update:modelValue="(value) => (periodPreset = value)"
/>
```

- 子コンポーネント側は、props名を`modelValue`、emitイベント名を`update:modelValue`
  という**決まった名前**にしておく必要がある(Vueがこの命名規則を前提に糖衣構文を展開するため)。
- 今回の`PeriodSelector.vue`はこの命名規則に沿って作っているので、
  親側では`v-model="periodPreset"`と書くだけで双方向のやり取りが成立している。

### `:modelValue`(props単体)との違い

- `:modelValue="periodPreset"` だけを書いた場合、行われるのは
  **「親→子への一方通行のprops渡し」だけ**。子側で値が変わっても親には伝わらない。
- `v-model="periodPreset"` は、上記のprops渡し **+** `@update:modelValue`での
  イベント受け取りを**セットで**行う。
- つまり`v-model`は「子への値渡し」と「子からのイベント受付」の両方を兼ねる仕組み。
  **子から親への通知(双方向のやり取り)が必要ない**なら`:modelValue`だけで十分だが、
  今回の`PeriodSelector`はユーザーの選択操作を親に伝える必要があるため`v-model`を使っている。

### 名前のカスタマイズ

`v-model:foo="bar"` のように引数を指定すると、propsは`foo`、イベント名は`update:foo`になる
(1つのコンポーネントで複数の`v-model`的なやり取りをしたい場合に使う)。

### 「使えるから常に`v-model`」にしない方がよい理由

`v-model`は「propsを渡す」+「イベントを受け取る準備をする」だけで、子コンポーネント側に
「必ず`emit`しなければならない」という強制力は無い。そのため、子が一度も`emit`しなくても
`v-model`自体は書けてしまう(その場合、実質的に`:modelValue`単体=一方通行と同じ挙動になる)。

- `v-model`を使うと、読み手は「ユーザー操作によって値が変わり、親に書き戻される(双方向)」
  と自然に期待する。
- 実際には一方通行(表示するだけ)なのに`v-model`にしていると、**期待と実態がズレて
  誤解を招く**コードになる。

判断基準: 「使えるから使う」のではなく、**そのコンポーネントが実際に双方向のやり取りを
必要としているか**で選ぶ。一方通行で十分なら、`modelValue`の命名規則に合わせず、
`label`や`value`など意味が伝わる名前で素直に`:propsName`を渡す方が適切。
