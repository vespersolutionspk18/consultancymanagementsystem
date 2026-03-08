resource "kubernetes_service" "cmscrm_redis" {
  metadata {
    name      = "${var.cmscrm_app_name}-redis"
    namespace = kubernetes_namespace.cmscrm.metadata.0.name
  }
  spec {
    selector = {
      app = "${var.cmscrm_app_name}-redis"
    }
    session_affinity = "ClientIP"
    port {
      port        = 6379
      target_port = 6379
    }

    type = "ClusterIP"
  }
}
