output "cloud_run_url" {
  description = "Cloud Runサービスの公開URL"
  value       = google_cloud_run_v2_service.discord_reblog.uri
}

output "cloud_run_service_name" {
  description = "Cloud Runサービス名"
  value       = google_cloud_run_v2_service.discord_reblog.name
}

output "artifact_registry_repository" {
  description = "Artifact Registryリポジトリ"
  value       = google_artifact_registry_repository.discord_reblog.name
}

output "container_image_url" {
  description = "コンテナイメージのURL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.discord_reblog.repository_id}/${var.service_name}:latest"
}
