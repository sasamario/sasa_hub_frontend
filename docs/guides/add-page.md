# ページ追加の手順

新しい画面(URL)を追加する際の手順。ルーティングの仕組み自体の詳細は
`docs/guides/nuxt/routing.md` を参照。

## 用意するファイル

**`app/pages/<ページ名>.vue`**

ファイル名がそのままURLになる(ファイルベースルーティング)。

| 作成するファイル | 対応するURL |
|---|---|
| `app/pages/index.vue` | `/` |
| `app/pages/github.vue` | `/github` |

最小構成の例:

```vue
<template>
  <div>
    <h1>画面名</h1>
  </div>
</template>
```

## 実行するコマンド

特になし。ファイルを置くだけでNuxtが自動的にルートを認識する
(開発サーバー起動中であれば、保存すると自動でホットリロードされる)。

## サイドメニューへのリンク追加

共通レイアウト(`app/layouts/default.vue`)のナビゲーション部分に、`<NuxtLink>` を追記する。

```vue
<NuxtLink to="/新しいページのパス">表示名</NuxtLink>
```

`<NuxtLink>` は現在のルートと一致すると自動で `router-link-exact-active` クラスが付き、
`layouts/default.vue` 側でこのクラスに対してハイライト用のスタイルを当てている。

## 注意点

- Nuxt 4の構成では、`pages/` はリポジトリ直下ではなく **`app/` ディレクトリの下**
  (`app/pages/`)に置く。
- レイアウトを適用させるには `app.vue` が `<NuxtLayout><NuxtPage /></NuxtLayout>`
  という構造になっている必要がある(この構造自体は初回のレイアウト構築時に対応済み)。
