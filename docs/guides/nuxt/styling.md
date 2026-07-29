# CSSの運用方針

Nuxt(Vue)におけるCSSの書き方には、大きく3つのレベルがある。用途に応じて使い分ける。

## 1. コンポーネント単位: `<style scoped>`

各`.vue`ファイルの中に書く、そのコンポーネント専用のスタイル。他のコンポーネントに
漏れない(仕組みの詳細は [scoped-style.md](../vue/scoped-style.md) 参照)。

**コンポーネント固有の見た目は基本的にここに書く。**

## 2. サイト全体共通: `nuxt.config.ts` の `css` オプション

```ts
export default defineNuxtConfig({
  css: ['~/assets/css/main.css'],
});
```

- 全ページ・全コンポーネントに効く、グローバルなスタイルを書く場所。
- 用途: CSS変数(テーマカラー)、`body`のリセット・基本フォント設定、
  `button`/`select`のようにアプリ全体で共通の見た目にしたい要素など。
- `app/assets/`は`pages/`や`layouts/`のような「置くだけで自動認識される」規約フォルダ
  **ではない**。ただの置き場所の慣習で、読み込ませるには`nuxt.config.ts`で
  明示的に指定する必要がある。

## 3. CSS変数(カスタムプロパティ)でテーマを管理

```css
/* main.css */
:root {
  --surface-2: #1b1b1f;
  --text-primary: #f2f2f3;
}
```

```css
/* 各コンポーネント側 */
.summary-card {
  background: var(--surface-2);
  color: var(--text-primary);
}
```

- 色などのテーマ値を1箇所(`main.css`)で管理でき、変更時の影響範囲が分かりやすい。
- 将来「ダーク/ライト切り替え」のような機能も、変数の値を差し替えるだけで実現しやすい。
- Nuxt固有の機能ではなくCSS標準の機能だが、Nuxtの「グローバルCSS」の仕組み
  (上記2)と組み合わせてよく使われる。

## 今回のプロジェクトでの実際の運用

- `app/assets/css/main.css`: CSS変数の定義、`body`の基本スタイル、`button`/`select`の
  共通スタイル。
- 各コンポーネント: 色などは`var(--xxx)`でmain.cssの変数を参照し、レイアウト・余白など
  そのコンポーネント固有の見た目は`<style scoped>`に直接書く。

## 参考: 今回は使っていない他の選択肢

- **Sass/Less等のプリプロセッサ**: パッケージを追加インストールするだけでNuxt(内部の
  Vite)が自動対応する。
- **Tailwind CSS / UnoCSS**: ユーティリティクラスでスタイリングする専用モジュール
  (`@nuxtjs/tailwindcss`など)。UIライブラリの方針が未定のため今回は見送り。
- **CSS Modules**(`<style module>`): `scoped`とは別の仕組みでのスタイル分離方法。
