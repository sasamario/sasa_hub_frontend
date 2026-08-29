# `<ClientOnly>`

Nuxt組み込みのコンポーネント。囲んだ内容を**サーバー側では描画せず、
クライアント(ブラウザ)側でのみ描画する**。

```vue
<ClientOnly>
  <CommitTrendChart :period-range="periodRange" />
</ClientOnly>
```

## なぜ必要か

Nuxtは通常SSR(サーバーサイドレンダリング)を行い、最初の画面はサーバー側で
一度組み立ててからブラウザに送る。しかし、ブラウザにしか無い機能(`<canvas>`など)を
前提にしたライブラリは、サーバー側で描画しようとするとエラーになることがある。

## 実際に遭遇した問題(Chart.js導入時)

Chart.js(`vue-chartjs`)はブラウザの`<canvas>`前提のライブラリ。
`chart.client.ts`(クライアント限定のプラグイン)で必要な部品を登録していたが、
Nuxtはサーバー側でもページを描画しようとするため、**サーバー側では
`chart.client.ts`が実行されておらず**、グラフ部品が登録されていない状態で
描画しようとして`"category" is not a registered scale`というエラー(500エラー)が
発生した。

`<ClientOnly>`でグラフコンポーネントを囲むことで、「このグラフはサーバー側では
描画せず、クライアント側でブラウザの機能が使える状態になってから描画する」という
挙動にでき、このエラーを解消できた。

## 使いどころ

- ブラウザ専用のライブラリ(Chart.jsなど、`<canvas>`や`window`を前提にするもの)を
  使うコンポーネント
- サーバーとクライアントで表示内容が食い違い、ハイドレーション警告
  (`Hydration completed but contains mismatches`)が出てしまう箇所。
  ハイドレーション自体の詳細は[hydration.md](./hydration.md)参照。
