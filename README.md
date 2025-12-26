# Work Tracker — 画面共有 × Prompt API

画面共有の映像を一定間隔でキャプチャし、ブラウザの Prompt API（`LanguageModel`）で作業サマリを自動生成してタイムライン化します。蓄積したサマリから作業レポート（Markdown）も生成できます。

## 特徴

- 画面共有（`getDisplayMedia`）+ 定期キャプチャ
- Prompt API（`LanguageModel`）で画像→サマリ、サマリ→レポート生成
- 履歴はブラウザの `localStorage` に保存（サーバー不要 / APIキー不要）
- GitHub Pages 向けの静的エクスポート（`output: "export"`）

## 動作要件

- Node.js 20+（開発/ビルド用）
- `LanguageModel` が利用できるブラウザ（Prompt API 対応環境）
  - DevTools で `typeof LanguageModel` が `"undefined"` の場合、サマリ/レポート生成は失敗します
- 画面共有を許可できること（HTTPS または `localhost`）

## セットアップ

```bash
npm ci
```

## 開発

```bash
npm run dev
```

`http://localhost:3000` を開きます。

## 使い方

1. 「録画を開始」を押して共有対象（画面/ウィンドウ/タブ）を選択
2. 「キャプチャ間隔」でサマリ生成の頻度を調整
3. 必要に応じて「レポート自動生成」を設定（または「レポート生成」を手動実行）
4. 生成されたレポートは展開して Markdown をコピー可能

## データ保存

- 生成したサマリ/レポートは `localStorage` に保存されます（「データをクリア」で削除）
- キャプチャ画像は永続保存しません（生成処理に利用した Blob を保持しません）

## ビルド（静的エクスポート）

```bash
npm run build
```

`out/` が生成されます。

### GitHub Pages（`basePath`）

Pages が `https://username.github.io/<repo>/` で公開される場合は、ビルド時に `NEXT_PUBLIC_BASE_PATH=<repo>` を指定します。

例:

```bash
NEXT_PUBLIC_BASE_PATH=prompt-api-live-share-demo npm run build
```

プレビューする場合は、`out/` を静的サーバーで配信して `<repo>/` パスを開きます。

## デプロイ

GitHub Pages へのデプロイは `.github/workflows/deploy.yml` を使用します（ワークフロー内で `NEXT_PUBLIC_BASE_PATH=prompt-api-live-share-demo` を設定済み）。

## ライセンス

`LICENSE` を参照してください。
