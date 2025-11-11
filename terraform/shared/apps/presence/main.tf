terraform {
  required_providers {
    nomad = {
      source = "hashicorp/nomad"
    }
  }
}

resource "nomad_job" "job" {
  jobspec = templatefile("${path.module}/job.hcl", {
    namespace  = var.namespace
    app_domain = var.app_domain
    replicas   = var.replicas
    cpu        = var.cpu
    memory     = var.memory
    image_tag  = var.image_tag
  })
}
