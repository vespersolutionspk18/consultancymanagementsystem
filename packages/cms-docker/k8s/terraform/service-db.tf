resource "kubernetes_service" "cmscrm_db" {
  metadata {
    name      = "${var.cmscrm_app_name}-db"
    namespace = kubernetes_namespace.cmscrm.metadata.0.name
  }
  spec {
    selector = {
      app = "${var.cmscrm_app_name}-db"
    }
    session_affinity = "ClientIP"
    port {
      port        = 5432
      target_port = 5432
    }

    type = "ClusterIP"
  }
}
