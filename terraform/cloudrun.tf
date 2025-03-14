# Cloud Runサービスの作成
resource "google_cloud_run_v2_service" "discord_reblog" {
  name     = var.service_name
  location = var.region

  template {
    containers {
      image = replace(var.container_image, "PROJECT_ID", var.project_id)
      
      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
      }

      # 環境変数の設定
      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "DISCORD_CACHE_TTL"
        value = "3600"
      }
      
      env {
        name  = "REDIRECT_URI"
        value = "https://${var.domain}/auth/callback"
      }
      
      # 環境変数の設定（非秘匿情報）
      env {
        name  = "DISCORD_CLIENT_ID"
        value = var.discord_client_id
      }
      
      # Secret Managerから環境変数を取得（秘匿情報）
      env {
        name = "DISCORD_CLIENT_SECRET"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret.discord_client_secret.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name = "DISCORD_BOT_TOKEN"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret.discord_bot_token.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name  = "REQUIRED_GUILD_ID"
        value = var.required_guild_id
      }
      
      env {
        name  = "FIREBASE_PROJECT_ID"
        value = var.firebase_project_id
      }
    }

    # スケーリング設定
    scaling {
      min_instance_count = var.min_instance_count
      max_instance_count = var.max_instance_count
    }
  }

  # 依存関係
  depends_on = [
    google_project_service.services,
    google_secret_manager_secret_iam_member.discord_client_secret_access,
    google_secret_manager_secret_iam_member.discord_bot_token_access,
  ]
}

# Cloud Runサービスの公開設定
resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.discord_reblog.location
  service  = google_cloud_run_v2_service.discord_reblog.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# サービスアカウントにFirestoreへのアクセス権限を付与
resource "google_project_iam_member" "firestore_access" {
  project = var.project_id
  role    = "roles/datastore.user"  # Firestoreへの読み書き権限
  member  = "serviceAccount:${var.project_number}-compute@developer.gserviceaccount.com"
}
