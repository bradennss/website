job "web" {
  namespace = "${namespace}"
  type = "service"

  update {
    max_parallel = 2
    min_healthy_time = "30s"
    healthy_deadline = "10m"
    progress_deadline = "15m"
    auto_revert = true
  }

  group "web" {
    count = ${replicas}

    network {
      mode = "bridge"

      port "web" {
        to = 80
      }
    }

    service {
      name = "${namespace}-web"
      port = "web"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.${namespace}-web.rule=Host(`${app_domain}`)",
        "traefik.http.routers.${namespace}-web.tls=true",
        "traefik.http.routers.${namespace}-web.tls.certresolver=letsencrypt",
        "traefik.http.services.${namespace}-web.loadbalancer.healthcheck.path=/api/health",
        "traefik.http.services.${namespace}-web.loadbalancer.healthcheck.interval=10"
      ]

      check {
        type = "http"
        port = "web"
        path = "/api/health"
        interval = "1s"
        timeout = "1s"
      }
    }

    task "web" {
      driver = "docker"

      config {
        image = "${image_tag}"
        ports = ["web"]
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
