variable "portainer_endpoint" {
  type = string
}

variable "portainer_api_key" {
  type      = string
  sensitive = true
}

variable "web_image_tag" {
  type = string
}

variable "presence_image_tag" {
  type = string
}
