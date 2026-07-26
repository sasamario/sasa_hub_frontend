# エディタ(VSCode)でのVue開発環境

`.vue`ファイルの型チェック・入力補完まわりで詰まった内容のまとめ。

## 症状

`.vue`ファイル内で以下のようなエラーがエディタ上に表示され続けた。

- `Cannot find name 'defineProps'` / `Cannot find name 'defineEmits'`
- `Cannot find name 'ref'` / `Cannot find name 'computed'`
- `Cannot find module '~/utils/xxx'`

いずれも**実行(ブラウザでの動作)には影響せず**、エディタの表示上だけの問題だった。

## 原因: 拡張機能の競合(Vetur)

VSCodeに **Vetur**(Nuxt 2 / Vue 2時代の拡張機能)が入っており、
現行の **Vue - Official**(Vue 3 / Nuxt 3以降向けの公式拡張機能、旧Volar)と競合していた。

- Veturは`.vue`ファイルを独自の(古い)方法で解釈しようとする。
- Vue - Officialと同時に有効化されていると、どちらが`.vue`ファイルの言語解析を担当するか
  競合し、`defineProps`のようなVue 3の`<script setup>`構文(コンパイラマクロ)が
  正しく認識されないことがある。
- **対応: Veturを無効化(またはアンインストール)する。** Nuxt 3以降のプロジェクトでは
  Vue - Officialのみで十分。

## `vue-tsc`について

`.vue`ファイルの型チェック専用のCLIツール。通常の`tsc`は`.ts`ファイルしか理解できないため、
`.vue`ファイル内の`<script setup>`やテンプレートの型チェックには`vue-tsc`が必要。

- 主な用途: `npm run typecheck`(`nuxi typecheck`)でプロジェクト全体の型エラーを
  まとめてチェックするコマンドを用意できる。
- 今回のVetur競合問題そのものの直接的な原因ではなかったが、Nuxt公式が推奨する
  ツールでもあるため、あわせて導入した。

```json
// package.json
"scripts": {
  "typecheck": "nuxi typecheck"
}
```

```bash
npm install -D vue-tsc
```

## 切り分けの流れ(参考)

1. `.vscode/settings.json`の設定(フォーマッター、TypeScriptバージョン)を疑ったが、
   設定自体は正しかった。
2. `.nuxt/tsconfig.json`(Nuxtが自動生成する型定義・パスエイリアス設定)を確認したが、
   `~/`のエイリアスも正しく定義されており、設定ファイル側の問題ではなかった。
3. `vue-tsc`を導入(実行には無関係だが、念のため試した)。
4. 最終的に、拡張機能の競合(Vetur)が原因と判明。無効化して解消した。

**教訓**: `.vue`ファイル関連のエディタ表示がおかしい時は、設定ファイルよりも先に
**拡張機能の競合**(特にVetur)を疑うと早く原因にたどり着けるかもしれない。
