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

#### 実際のFirestoreを使用する場合

```bash
# 開発サーバーの起動
pnpm run dev
```

#### Firestoreエミュレータを使用する場合

##### Firebase CLIを使用する場合（Javaが必要）

```bash
# 別のターミナルでFirestoreエミュレータを起動
pnpm run emulators

# エミュレータを使用して開発サーバーを起動
pnpm run dev:emulator
```

##### Dockerを使用する場合（推奨）

```bash
# 方法1: 別々のターミナルで起動
# 別のターミナルでDockerコンテナを起動
pnpm run emulators:docker

# エミュレータを使用して開発サーバーを起動
pnpm run dev:emulator:docker

# 終了時にDockerコンテナを停止
pnpm run emulators:docker:stop
```

```bash
# 方法2: 一度に起動（推奨）
# Dockerコンテナとエミュレータモードのサーバーを一度に起動
pnpm run dev:docker

# 終了時にDockerコンテナを停止
pnpm run emulators:docker:stop
```

```bash
# ブラウザでアクセス
open http://localhost:3000

# Firestoreエミュレータのダッシュボード
open http://localhost:4000
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
- [Terraform](https://www.terraform.io/) - インフラストラクチャ管理
- [Google Cloud Run](https://cloud.google.com/run) - サーバーレスコンテナ実行環境
- [Cloud Build](https://cloud.google.com/build) - CI/CD

## Google Cloudへのデプロイ

このアプリケーションはGoogle Cloud Runにデプロイすることができます。デプロイには以下の手順を実行してください。

### 前提条件

- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- [Terraform](https://www.terraform.io/downloads.html)
- [Docker](https://www.docker.com/get-started)
- Google Cloudアカウントとプロジェクト
- Firebase/Firestoreプロジェクト（既存のものを使用可能）

### デプロイ手順

#### 1. Google Cloudプロジェクトの設定

```bash
# Google Cloudにログイン
gcloud auth login

# プロジェクトの設定
gcloud config set project YOUR_PROJECT_ID

# 必要なAPIを有効化
gcloud services enable cloudresourcemanager.googleapis.com iam.googleapis.com compute.googleapis.com run.googleapis.com secretmanager.googleapis.com artifactregistry.googleapis.com firestore.googleapis.com cloudbuild.googleapis.com
```

#### 2. Terraformの設定

```bash
# terraform.tfvars.exampleをコピーして編集
cd terraform
cp terraform.tfvars.example terraform.tfvars

# terraform.tfvarsを編集して必要な値を設定
# エディタで開く
nano terraform.tfvars
```

#### 3. Terraformでインフラストラクチャをデプロイ

```bash
# Terraformの初期化
terraform init

# 実行計画の確認
terraform plan

# インフラストラクチャのデプロイ
terraform apply
```

#### 4. Cloud Buildトリガーの設定

Cloud Buildを使用して継続的デプロイを設定します：

```bash
# Cloud Buildトリガーの作成
gcloud builds triggers create github \
  --name="discord-reblog-deploy" \
  --repo="https://github.com/YOUR_USERNAME/discord-reblog" \
  --branch-pattern="main" \
  --build-config="cloudbuild.yaml"
```

必要に応じて、Cloud Buildサービスアカウントに適切な権限を付与します：

```bash
# Cloud Buildサービスアカウントの取得
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# 必要な権限を付与
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/iam.serviceAccountUser"
```

#### 5. DNSの設定

外部のDNSサービスを使用して、Cloud RunサービスのURLをカスタムドメインにマッピングします。

```bash
# Cloud RunサービスのURLを取得
gcloud run services describe discord-reblog --region=asia-northeast1 --format="value(status.url)"

# 取得したURLを外部DNSサービスでCNAMEレコードとして設定
# reblog.manhattan.cafe -> YOUR_CLOUD_RUN_URL
```

#### 6. 手動デプロイ（オプション）

Cloud Buildトリガーを使用せずに手動でデプロイする場合：

```bash
# Dockerイメージのビルド
docker build -t asia-northeast1-docker.pkg.dev/YOUR_PROJECT_ID/discord-reblog/discord-reblog:latest .

# Artifact Registryへのプッシュ
docker push asia-northeast1-docker.pkg.dev/YOUR_PROJECT_ID/discord-reblog/discord-reblog:latest

# Cloud Runへのデプロイ
gcloud run deploy discord-reblog \
  --image=asia-northeast1-docker.pkg.dev/YOUR_PROJECT_ID/discord-reblog/discord-reblog:latest \
  --region=asia-northeast1 \
  --platform=managed \
  --allow-unauthenticated
```
