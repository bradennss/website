job "presence" {
  namespace = "${namespace}"
  type = "service"

  update {
    max_parallel = 2
    min_healthy_time = "30s"
    healthy_deadline = "10m"
    progress_deadline = "15m"
    auto_revert = true
  }

  group "presence" {
    count = ${replicas}

    network {
      mode = "bridge"

      port "presence" {
        to = 80
      }
    }

    service {
      name = "${namespace}-presence"
      port = "presence"

      tags = [
        "traefik.enable=true",
        "traefik.http.routers.${namespace}-presence.rule=Host(`${app_domain}`) && PathPrefix(`/presence`)",
        "traefik.http.routers.${namespace}-presence.tls=true",
        "traefik.http.routers.${namespace}-presence.tls.certresolver=letsencrypt",
        "traefik.http.routers.${namespace}-presence.middlewares=${namespace}-presence-stripprefix",
        "traefik.http.middlewares.${namespace}-presence-stripprefix.stripprefix.prefixes=/presence",
        "traefik.http.services.${namespace}-presence.loadbalancer.healthcheck.path=/",
        "traefik.http.services.${namespace}-presence.loadbalancer.healthcheck.interval=10"
      ]

      check {
        type = "http"
        port = "presence"
        path = "/"
        interval = "1s"
        timeout = "1s"
      }
    }

    task "presence" {
      driver = "docker"

      config {
        image = "${image_tag}"
        ports = ["presence"]
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
