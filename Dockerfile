FROM node:20-slim AS builder

WORKDIR /app

# pnpmのインストール
RUN npm install -g pnpm

# 依存関係ファイルのコピー
COPY package.json pnpm-lock.yaml ./

# 依存関係のインストール
RUN pnpm install --frozen-lockfile

# ソースコードのコピー
COPY . .

# TypeScriptのコンパイル
RUN pnpm tsc

# 実行用のイメージ
FROM node:20-slim

WORKDIR /app

# pnpmのインストール
RUN npm install -g pnpm

# 本番環境の依存関係のみをインストール
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# ビルドステージからコンパイル済みのコードをコピー
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/static ./src/static

# 環境変数の設定
ENV NODE_ENV=production
ENV PORT=8080

# アプリケーションの起動
CMD ["node", "dist/index.js"]

# コンテナがリッスンするポートを公開
EXPOSE 8080
