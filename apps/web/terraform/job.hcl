job "website" {
  namespace = "${namespace}"
  type = "service"

  update {
    max_parallel = 2
    min_healthy_time = "30s"
    healthy_deadline = "10m"
    progress_deadline = "15m"
    auto_revert = true
  }

  group "website" {
    count = ${replicas}

    network {
      mode = "bridge"

      port "website" {
        to = 80
      }
    }

    service {
      name = "${namespace}-website"
      port = "website"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.${namespace}-website.rule=Host(`${app_domain}`)",
        "traefik.http.routers.${namespace}-website.tls=true",
        "traefik.http.routers.${namespace}-website.tls.certresolver=letsencrypt",
        "traefik.http.services.${namespace}-website.loadbalancer.healthcheck.path=/api/health",
        "traefik.http.services.${namespace}-website.loadbalancer.healthcheck.interval=10"
      ]

      check {
        type = "http"
        port = "website"
        path = "/api/health"
        interval = "1s"
        timeout = "1s"
      }
    }

    task "website" {
      driver = "docker"

      config {
        image = "${image_tag}"
        ports = ["website"]
      }

      resources {
        cpu = ${cpu}
        memory = ${memory}
      }

      env {
        PORT = "80"
        HOST = "0.0.0.0"
      }
    }
  }
}
