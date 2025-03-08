# Discord Client Secret (手動で作成されたSecret Managerリソースを参照)
data "google_secret_manager_secret" "discord_client_secret" {
  secret_id = "discord-client-secret"
}

# Discord Bot Token (手動で作成されたSecret Managerリソースを参照)
data "google_secret_manager_secret" "discord_bot_token" {
  secret_id = "discord-bot-token"
}

# Secret Managerへのアクセス権限をCloud Runサービスアカウントに付与
resource "google_secret_manager_secret_iam_member" "discord_client_secret_access" {
  secret_id = data.google_secret_manager_secret.discord_client_secret.id
  role      = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${var.project_number}-compute@developer.gserviceaccount.com"
}

resource "google_secret_manager_secret_iam_member" "discord_bot_token_access" {
  secret_id = data.google_secret_manager_secret.discord_bot_token.id
  role      = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${var.project_number}-compute@developer.gserviceaccount.com"
}
