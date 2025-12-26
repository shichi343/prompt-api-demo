# AGENTS

- プロジェクト: Next.js (App Router, TypeScript, Tailwind CSS v4)
- パッケージマネージャー: npm（`package-lock.json`）
- 品質/フォーマット: Ultracite(Biome)（`npm run format` / `npm run lint` / `npm run typecheck`）
- エディタ: VSCode推奨（`.vscode/settings.json` で保存時フォーマット有効化済み）
- デプロイ想定: 静的エクスポート（`output: "export"` → `out/`、GitHub Pages）
- UI: shadcn/ui（`alert-dialog` / `button` / `dialog` / `slider` / `tabs` / `sonner` / `spinner` など）
- テーマ: light/dark 切替（デフォルト `dark`、`localStorage` に保存）
- 主要ブラウザAPI: 画面共有（`getDisplayMedia`）/ Prompt API（`LanguageModel`）

## 重要な前提（制約）

- ランタイムは基本的にクライアント完結です（サーバー依存なし）。
- 静的エクスポート前提のため、サーバー専用機能（API Routes / サーバーでの永続化等）は追加しないでください。
- Prompt API は `LanguageModel` というブラウザ提供グローバルを利用します。未対応環境では `typeof LanguageModel === "undefined"` になり得るため、必ずガードして劣化動作（エラー表示）にします。
- 画面キャプチャ画像は永続保存しません（サマリ/レポートのみを `localStorage` に保存）。

## 主要ファイル

- `app/page.tsx`: 画面共有の開始/停止、定期キャプチャ、サマリ/レポート生成、テーマ切替、永続化のオーケストレーション
- `app/layout.tsx`: フォント/テーマプロバイダ/Toaster
- `lib/session-pool.ts`: Prompt API セッション管理（可能なら `clone()` を利用して高速化）
- `lib/llm.ts`: サマリ/レポート生成の薄いラッパー
- `lib/capture.ts`: 画面共有ストリーム→フレームキャプチャ（PNG Blob）
- `lib/storage.ts`: `localStorage` スキーマ（interval / summaries / reports / theme）

## デプロイ
- GitHub Actions: `.github/workflows/deploy.yml` で Pages デプロイ
- ビルド/エクスポート: `npm run build`（`output: "export"` で `out/` が生成）
- basePath: Pages 公開URLが `https://username.github.io/<repo>/` の場合は `NEXT_PUBLIC_BASE_PATH=<repo>` を環境変数で指定（ルート直下なら不要）。現在のワークフローでは `NEXT_PUBLIC_BASE_PATH=prompt-api-live-share-demo` を設定済み。

## 開発コマンド

- 開発: `npm run dev`
- ビルド: `npm run build`
- 型チェック: `npm run typecheck`
- フォーマット: `npm run format`
- Lint: `npm run lint`
