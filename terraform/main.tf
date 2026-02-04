terraform {
  required_providers {
    portainer = {
      source = "portainer/portainer"
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
  }
}

provider "portainer" {
  endpoint = var.portainer_endpoint
  api_key  = var.portainer_api_key
}

locals {
  namespace  = "braden-lol"
  app_domain = "new.braden.lol"
}

resource "portainer_stack" "stack" {
  name            = local.namespace
  deployment_type = "standalone"
  method          = "string"
  endpoint_id     = 1

  stack_file_content = templatefile("${path.module}/compose.yml", {
    namespace  = local.namespace
    app_domain = local.app_domain

    web_image_tag = var.web_image_tag
    web_replicas  = 2

    presence_image_tag = var.presence_image_tag
    presence_replicas  = 1
  })
}
