variable "project_id" {
  description = "Google Cloud プロジェクトID"
  type        = string
}

variable "region" {
  description = "デプロイするリージョン"
  type        = string
  default     = "asia-northeast1"
}

variable "domain" {
  description = "アプリケーションのドメイン名"
  type        = string
  default     = "reblog.manhattan.cafe"
}

variable "service_name" {
  description = "Cloud Runサービス名"
  type        = string
  default     = "discord-reblog"
}

variable "container_image" {
  description = "コンテナイメージのURL"
  type        = string
  default     = "asia-northeast1-docker.pkg.dev/PROJECT_ID/discord-reblog/discord-reblog:latest"
}

variable "min_instance_count" {
  description = "最小インスタンス数"
  type        = number
  default     = 0
}

variable "max_instance_count" {
  description = "最大インスタンス数"
  type        = number
  default     = 10
}

variable "cpu" {
  description = "CPUの割り当て"
  type        = string
  default     = "1"
}

variable "memory" {
  description = "メモリの割り当て"
  type        = string
  default     = "512Mi"
}

variable "discord_client_id" {
  description = "Discord OAuth2 クライアントID"
  type        = string
  sensitive   = true
}

variable "discord_client_secret" {
  description = "Discord OAuth2 クライアントシークレット"
  type        = string
  sensitive   = true
}

variable "discord_bot_token" {
  description = "Discord Botトークン"
  type        = string
  sensitive   = true
}

variable "required_guild_id" {
  description = "必要なDiscordギルドID"
  type        = string
  sensitive   = true
}

variable "firebase_api_key" {
  description = "Firebase API Key"
  type        = string
  sensitive   = true
}

variable "firebase_auth_domain" {
  description = "Firebase Auth Domain"
  type        = string
}

variable "firebase_project_id" {
  description = "Firebase Project ID"
  type        = string
}

variable "firebase_storage_bucket" {
  description = "Firebase Storage Bucket"
  type        = string
}

variable "firebase_messaging_sender_id" {
  description = "Firebase Messaging Sender ID"
  type        = string
  sensitive   = true
}

variable "firebase_app_id" {
  description = "Firebase App ID"
  type        = string
  sensitive   = true
}
