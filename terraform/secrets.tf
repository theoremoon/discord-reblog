# Discord Client ID
resource "google_secret_manager_secret" "discord_client_id" {
  secret_id = "discord-client-id"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "discord_client_id" {
  secret      = google_secret_manager_secret.discord_client_id.id
  secret_data = var.discord_client_id
}

# Discord Client Secret
resource "google_secret_manager_secret" "discord_client_secret" {
  secret_id = "discord-client-secret"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "discord_client_secret" {
  secret      = google_secret_manager_secret.discord_client_secret.id
  secret_data = var.discord_client_secret
}

# Discord Bot Token
resource "google_secret_manager_secret" "discord_bot_token" {
  secret_id = "discord-bot-token"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "discord_bot_token" {
  secret      = google_secret_manager_secret.discord_bot_token.id
  secret_data = var.discord_bot_token
}

# Required Guild ID
resource "google_secret_manager_secret" "required_guild_id" {
  secret_id = "required-guild-id"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "required_guild_id" {
  secret      = google_secret_manager_secret.required_guild_id.id
  secret_data = var.required_guild_id
}

# Firebase API Key
resource "google_secret_manager_secret" "firebase_api_key" {
  secret_id = "firebase-api-key"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "firebase_api_key" {
  secret      = google_secret_manager_secret.firebase_api_key.id
  secret_data = var.firebase_api_key
}

# Firebase Messaging Sender ID
resource "google_secret_manager_secret" "firebase_messaging_sender_id" {
  secret_id = "firebase-messaging-sender-id"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "firebase_messaging_sender_id" {
  secret      = google_secret_manager_secret.firebase_messaging_sender_id.id
  secret_data = var.firebase_messaging_sender_id
}

# Firebase App ID
resource "google_secret_manager_secret" "firebase_app_id" {
  secret_id = "firebase-app-id"
  
  replication {
    auto {}
  }
  
  depends_on = [google_project_service.services]
}

resource "google_secret_manager_secret_version" "firebase_app_id" {
  secret      = google_secret_manager_secret.firebase_app_id.id
  secret_data = var.firebase_app_id
}

# Secret Managerへのアクセス権限をCloud Runサービスアカウントに付与
resource "google_secret_manager_secret_iam_member" "discord_client_id_access" {
  secret_id = google_secret_manager_secret.discord_client_id.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.project_id}@appspot.gserviceaccount.com"
  
  depends_on = [google_secret_manager_secret.discord_client_id]
}

resource "google_secret_manager_secret_iam_member" "discord_client_secret_access" {
  secret_id = google_secret_manager_secret.discord_client_secret.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.project_id}@appspot.gserviceaccount.com"
  
  depends_on = [google_secret_manager_secret.discord_client_secret]
}

resource "google_secret_manager_secret_iam_member" "discord_bot_token_access" {
  secret_id = google_secret_manager_secret.discord_bot_token.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.project_id}@appspot.gserviceaccount.com"
  
  depends_on = [google_secret_manager_secret.discord_bot_token]
}

resource "google_secret_manager_secret_iam_member" "required_guild_id_access" {
  secret_id = google_secret_manager_secret.required_guild_id.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.project_id}@appspot.gserviceaccount.com"
  
  depends_on = [google_secret_manager_secret.required_guild_id]
}

resource "google_secret_manager_secret_iam_member" "firebase_api_key_access" {
  secret_id = google_secret_manager_secret.firebase_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.project_id}@appspot.gserviceaccount.com"
  
  depends_on = [google_secret_manager_secret.firebase_api_key]
}

resource "google_secret_manager_secret_iam_member" "firebase_messaging_sender_id_access" {
  secret_id = google_secret_manager_secret.firebase_messaging_sender_id.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.project_id}@appspot.gserviceaccount.com"
  
  depends_on = [google_secret_manager_secret.firebase_messaging_sender_id]
}

resource "google_secret_manager_secret_iam_member" "firebase_app_id_access" {
  secret_id = google_secret_manager_secret.firebase_app_id.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.project_id}@appspot.gserviceaccount.com"
  
  depends_on = [google_secret_manager_secret.firebase_app_id]
}
