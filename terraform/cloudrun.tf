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
        name  = "PORT"
        value = "8080"
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
        name = "FIREBASE_API_KEY"
        value_source {
          secret_key_ref {
            secret  = data.google_secret_manager_secret.firebase_api_key.secret_id
            version = "latest"
          }
        }
      }
      
      env {
        name  = "FIREBASE_AUTH_DOMAIN"
        value = var.firebase_auth_domain
      }
      
      env {
        name  = "FIREBASE_PROJECT_ID"
        value = var.firebase_project_id
      }
      
      env {
        name  = "FIREBASE_STORAGE_BUCKET"
        value = var.firebase_storage_bucket
      }
      
      env {
        name  = "FIREBASE_MESSAGING_SENDER_ID"
        value = var.firebase_messaging_sender_id
      }
      
      env {
        name  = "FIREBASE_APP_ID"
        value = var.firebase_app_id
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
    google_secret_manager_secret_iam_member.firebase_api_key_access
  ]
}

# Cloud Runサービスの公開設定
resource "google_cloud_run_service_iam_member" "public_access" {
  location = google_cloud_run_v2_service.discord_reblog.location
  service  = google_cloud_run_v2_service.discord_reblog.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
