######################
# Required Variables #
######################
variable "cmscrm_pgdb_admin_password" {
  type        = string
  description = "CMSCRM password for postgres database."
  sensitive   = true
}

variable "cmscrm_app_hostname" {
  type        = string
  description = "The protocol, DNS fully qualified hostname, and port used to access CMSCRM in your environment. Ex: https://crm.example.com:443"
}

######################
# Optional Variables #
######################
variable "cmscrm_app_name" {
  type        = string
  default     = "cmscrm"
  description = "A friendly name prefix to use for every component deployed."
}

variable "cmscrm_server_image" {
  type        = string
  default     = "cmscrm/cms:latest"
  description = "CMSCRM server image for the server deployment. This defaults to latest. This value is also used for the workers image."
}

variable "cmscrm_db_image" {
  type        = string
  default     = "cmscrm/cms-postgres-spilo:latest"
  description = "CMSCRM image for database deployment. This defaults to latest."
}

variable "cmscrm_server_replicas" {
  type        = number
  default     = 1
  description = "Number of replicas for the CMSCRM server deployment. This defaults to 1."
}

variable "cmscrm_worker_replicas" {
  type        = number
  default     = 1
  description = "Number of replicas for the CMSCRM worker deployment. This defaults to 1."
}

variable "cmscrm_db_replicas" {
  type        = number
  default     = 1
  description = "Number of replicas for the CMSCRM database deployment. This defaults to 1."
}

variable "cmscrm_server_data_mount_path" {
  type        = string
  default     = "/app/packages/cms-server/.local-storage"
  description = "CMSCRM mount path for servers application data. Defaults to '/app/packages/cms-server/.local-storage'."
}

variable "cmscrm_db_pv_path" {
  type        = string
  default     = ""
  description = "Local path to use to store the physical volume if using local storage on nodes."
}

variable "cmscrm_server_pv_path" {
  type        = string
  default     = ""
  description = "Local path to use to store the physical volume if using local storage on nodes."
}

variable "cmscrm_db_pv_capacity" {
  type        = string
  default     = "10Gi"
  description = "Storage capacity provisioned for database persistent volume."
}

variable "cmscrm_db_pvc_requests" {
  type        = string
  default     = "10Gi"
  description = "Storage capacity reservation for database persistent volume claim."
}

variable "cmscrm_server_pv_capacity" {
  type        = string
  default     = "10Gi"
  description = "Storage capacity provisioned for server persistent volume."
}

variable "cmscrm_server_pvc_requests" {
  type        = string
  default     = "10Gi"
  description = "Storage capacity reservation for server persistent volume claim."
}

variable "cmscrm_namespace" {
  type        = string
  default     = "cmscrm"
  description = "Namespace for all CMSCRM resources"
}

variable "cmscrm_redis_replicas" {
  type        = number
  default     = 1
  description = "Number of replicas for the CMSCRM Redis deployment. This defaults to 1."
}

variable "cmscrm_redis_image" {
  type        = string
  default     = "redis/redis-stack-server:latest"
  description = "CMSCRM image for Redis deployment. This defaults to latest."
}

variable "cmscrm_docker_data_mount_path" {
  type        = string
  default     = "/app/docker-data"
  description = "CMSCRM mount path for servers application data. Defaults to '/app/docker-data'."
}

variable "cmscrm_docker_data_pv_path" {
  type        = string
  default     = ""
  description = "Local path to use to store the physical volume if using local storage on nodes."
}

variable "cmscrm_docker_data_pv_capacity" {
  type        = string
  default     = "100Mi"
  description = "Storage capacity provisioned for server persistent volume."
}

variable "cmscrm_docker_data_pvc_requests" {
  type        = string
  default     = "100Mi"
  description = "Storage capacity reservation for server persistent volume claim."
}
