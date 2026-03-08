resource "kubernetes_namespace" "cmscrm" {
  metadata {
    annotations = {
      name = var.cmscrm_namespace
    }

    name = var.cmscrm_namespace
  }
}
