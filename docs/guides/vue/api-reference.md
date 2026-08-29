# Vue API一覧(随時追記)

開発中に出てきたVueのAPI・メソッドを一覧にしていく。「これ何だっけ」となったらここを見る。
詳細な説明が必要なものは、別ファイルにまとめた上でここからリンクする。

| 名前 | 種別 | 一言説明 |
|---|---|---|
| `ref` | Composition API | 値の入れ物を作る。中身が変わると画面も自動更新される。詳細: [composition-api.md](./composition-api.md) |
| `computed` | Composition API | 他の値をもとに自動で再計算される値を作る。詳細: [composition-api.md](./composition-api.md) |
| `defineProps` | コンパイラマクロ(`<script setup>`専用) | 親から渡される値(props)の受け取り口を定義する。詳細: [props-emits.md](./props-emits.md) |
| `defineEmits` | コンパイラマクロ(`<script setup>`専用) | 子から親へのイベント発火の定義。詳細: [props-emits.md](./props-emits.md) |
| `emit` | `defineEmits`の戻り値 | 実際に親へイベントを発火する関数。詳細: [props-emits.md](./props-emits.md) |
| `v-model` | テンプレート構文(ディレクティブ) | props+emitのやり取りをまとめて書ける糖衣構文。詳細: [props-emits.md](./props-emits.md) |
| `slot` | コンポーネント合成の仕組み | 親から渡された内容を子のテンプレート内に差し込む穴。詳細: [routing.md](../nuxt/routing.md)(レイアウト文脈で説明) |
| `watch` | Composition API | 指定した値が変わるたびに任意の処理(副作用)を実行する。詳細: [composition-api.md](./composition-api.md) |
| `onMounted` | Composition API(ライフサイクルフック) | コンポーネントが実際に画面に表示された直後に処理を実行する。詳細: [async-data.md](../nuxt/async-data.md) |
| `useAsyncData` | Nuxt composable | データ取得+リアクティブな反映をまとめて面倒見てくれる。詳細: [async-data.md](../nuxt/async-data.md) |
