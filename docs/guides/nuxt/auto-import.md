# 自動インポート

Nuxtの大きな特徴の1つ。Vue単体では`import`が必要なものも、Nuxtでは`app/`配下のファイル内で
**importを書かずにそのまま使える**ようになっている。

## Vue単体の場合(比較)

```ts
import { ref, computed } from 'vue';

const count = ref(0);
```

## Nuxtの場合

```ts
// importなしでそのまま使える
const count = ref(0);
```

## 自動インポートされる主なもの

- **Vue本体のAPI**: `ref`, `computed`, `watch`, `onMounted` など(Composition API全般)
- **Nuxtが提供するAPI**: `useRuntimeConfig`, `useFetch`, `navigateTo` など(`use`から始まる関数=composable)
- **`app/components/`配下のコンポーネント**: ファイルを置くだけでテンプレート内にタグとして使える
  (今回の`PeriodSelector.vue`も、`app/pages/index.vue`側で`import`せずに
  `<PeriodSelector />`とだけ書けば使えている)
- **`app/utils/`配下の関数**: プロジェクトで自作した関数も、この場所に置けば自動インポート対象になる
  (`app/utils/period.ts`の`resolvePeriodRange`など。ただし現状は`~/utils/period`から
  明示的に`import`する書き方にしている。自動インポートに寄せるかは今後検討)

## 裏側の仕組み(簡単に)

Nuxtはビルド時に、プロジェクト内のファイル構成を解析し、「このファイルではこの関数が
使われているから、裏側で自動的にimport文を追加しておく」という処理を行っている。
エディタの型チェックが正しく動くように、`.nuxt/`ディレクトリに型定義ファイル
(`imports.d.ts`など)を自動生成しているのもこの仕組みの一部。
