terraform {
  required_providers {
    nomad = {
      source = "hashicorp/nomad"
    }
  }

  backend "s3" {
    bucket                      = "braden-lol-tf-state"
    key                         = "terraform.tfstate"
    region                      = "auto"
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
    use_path_style              = true
    # access_key                  = "<YOUR_R2_ACCESS_KEY>"
    # secret_key                  = "<YOUR_R2_ACCESS_SECRET>"
    # endpoints                   = { s3 = "https://<YOUR_ACCOUNT_ID>.r2.cloudflarestorage.com" }
  }
}

locals {
  app_domain = "braden.lol"
}

resource "nomad_namespace" "namespace" {
  name        = "braden-lol"
  description = "braden.lol"
}

resource "nomad_job" "website" {
  jobspec = templatefile("${path.module}/job.hcl", {
    namespace  = nomad_namespace.namespace.name
    app_domain = local.app_domain
    replicas   = 2
    cpu        = 100
    memory     = 100
    image_tag  = var.website_image_tag
  })
}
