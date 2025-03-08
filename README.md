# Discord Reblog

Discordのメッセージを取得して、Reblogとして保存・表示するアプリケーション。

## 機能

- Discord OAuth2認証によるログイン
- 特定のDiscordサーバーに所属しているユーザーのみアクセス可能
- メッセージリンクからメッセージを取得
- チャンネルから最新メッセージを取得
- メッセージの前後のコンテキストを表示
- メッセージを選択してReblogエントリとして保存
- Reblogタイムラインの表示

## セットアップ

### 前提条件

- Node.js (v16以上)
- pnpm
- Discord Bot Token
- Discord OAuth2アプリケーション
- Firebase/Firestoreプロジェクト

### インストール

```bash
# 依存関係のインストール
pnpm install
```

### 環境変数の設定

`.env.example`ファイルを`.env`にコピーして、必要な環境変数を設定します。

```bash
cp .env.example .env
```

#### Discord設定

1. [Discord Developer Portal](https://discord.com/developers/applications)で新しいアプリケーションを作成
2. OAuth2設定でリダイレクトURIを`http://localhost:3000/oauth/callback`に設定
3. Botを作成し、トークンを取得
4. 必要なスコープ（`identify`, `guilds`, `messages.read`）を設定

#### Firebase/Firestore設定

1. [Firebase Console](https://console.firebase.google.com/)で新しいプロジェクトを作成
2. Firestoreデータベースを作成
3. プロジェクト設定からウェブアプリを追加
4. 設定情報を`.env`ファイルに追加

### 実行

```bash
# 開発サーバーの起動
pnpm run dev
```

```bash
# ブラウザでアクセス
open http://localhost:3000
```

## 使い方

1. トップページからDiscordでログイン
2. メッセージリンクを入力するか、チャンネルを選択して最新メッセージを取得
3. 表示されたメッセージから保存したいメッセージを選択
4. 「選択したメッセージをReblog」ボタンをクリック
5. タイトルと説明を入力して保存
6. Reblogタイムラインで保存したエントリを確認

## 技術スタック

- [Hono](https://hono.dev/) - Webフレームワーク
- [Discord API](https://discord.com/developers/docs/intro) - Discord連携
- [Firebase/Firestore](https://firebase.google.com/docs/firestore) - データベース
