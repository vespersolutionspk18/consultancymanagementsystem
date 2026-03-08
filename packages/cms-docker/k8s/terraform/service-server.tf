resource "kubernetes_service" "cmscrm_server" {
  metadata {
    name      = "${var.cmscrm_app_name}-server"
    namespace = kubernetes_namespace.cmscrm.metadata.0.name
  }
  spec {
    selector = {
      app = "${var.cmscrm_app_name}-server"
    }
    session_affinity = "ClientIP"
    port {
      name        = "http-tcp"
      port        = 3000
      target_port = 3000
    }

    type = "ClusterIP"
  }
}
