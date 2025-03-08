variable "project_id" {
  description = "Google Cloud プロジェクトID"
  type        = string
}

variable "project_number" {
  description = "Google Cloud プロジェクトNumber"
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

variable "required_guild_id" {
  description = "必要なDiscordギルドID"
  type        = string
  sensitive   = true
}

variable "firebase_project_id" {
  description = "Firebase Project ID"
  type        = string
}

