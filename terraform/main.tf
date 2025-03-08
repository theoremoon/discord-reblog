terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
  
  # 状態ファイルをGCSに保存する設定
  # 実際のデプロイ時にコメントを外して使用
  # backend "gcs" {
  #   bucket = "discord-reblog-terraform-state"
  #   prefix = "terraform/state"
  # }
  
  required_version = ">= 1.0.0"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# プロジェクトのサービスを有効化
resource "google_project_service" "services" {
  for_each = toset([
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
    "compute.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "artifactregistry.googleapis.com",
    "firestore.googleapis.com",
    "cloudbuild.googleapis.com"
  ])

  project = var.project_id
  service = each.key

  disable_dependent_services = true
  disable_on_destroy         = false
}

# Artifact Registryリポジトリの作成
resource "google_artifact_registry_repository" "discord_reblog" {
  provider = google-beta
  
  location      = var.region
  repository_id = "discord-reblog"
  description   = "Docker repository for Discord Reblog"
  format        = "DOCKER"

  depends_on = [google_project_service.services]
}
