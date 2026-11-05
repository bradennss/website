# Website migration to Sable

## Intent and scope

Restore the public website at `https://braden.lol` on the current Sable platform, preserving existing content, routes, and live cursor presence. The user authorized the live cutover. Do not change the UI, retire infrastructure, reinstall the host, or alter unrelated platform services.

## Observed state

On November 5, 2026, the apex A record already points to Sable at `135.148.53.166`, with no AAAA response. The current cluster contains no website namespace, workload, source registration, or public route. HTTP returns 404 and HTTPS presents Traefik's default self-signed certificate. There is no running legacy website deployment in this cluster to preserve as a rollback target. The saved local kubeconfig fails CA validation; the documented pinned SSH identity successfully accesses the live cluster through `sudo k3s kubectl`.

The public `bradennss/website` repository builds Next.js and a singleton in-memory WebSocket presence server. Its existing delivery targets Harbor and creates workload service accounts, which do not match the current Sable contract. Presence accepts WebSocket upgrades at `/`; the public `/presence` route therefore needs a prefix rewrite.

## Approaches

1. Adapt both repositories to Sable's documented GitOps and GHCR delivery. Keep application behavior unchanged and provision public routing in the operator repository. Recommended because it preserves Sable's ownership and isolation boundaries.
2. Apply website manifests directly using operator credentials. Faster initially, but does not provide durable project delivery or the required project-scoped reconciliation. Rejected.
3. Restore the retired Harbor-based platform. Expands the task into infrastructure recovery and conflicts with the requested destination. Rejected.

## Proposed design

- Retain both existing container builds, immutable image digests, web health checks, two web replicas, and one presence replica. Keep presence singleton because its room state is process-local.
- Publish application images to GHCR through repository-scoped GitHub Actions permissions. Follow Sable's deployment pull-request release flow, merging the initial deployment for this authorized cutover. Resolve package pull access without placing platform credentials in project CI.
- Use the operator-provisioned `workload` service account and explicitly disable service-account token mounting. Remove project-created service accounts and obsolete Harbor pull references. Add ordinary internal web and presence Services and maintain restricted security contexts and resource limits.
- Provision the namespace, project policies, quotas, source registration, and project-scoped reconciliation in the Sable repository using existing examples and dependency ordering.
- Declare unauthenticated public routes for the website and presence. Route `/` to web and rewrite the `/presence` prefix to `/` for presence, including the existing trailing-slash client path. Keep `PRESENCE_SERVER_URL=wss://braden.lol/presence`.
- Use the documented custom-domain staging then production HTTP-01 certificate flow. Existing DNS needs no cutover write unless authoritative inspection finds a conflicting record.
- Publish only scoped, reviewed changes to the website and private Sable repositories. Preserve unrelated working files and services.

## Verification and recovery

Run website lint, format, typecheck, tests, build, manifest rendering, and Sable `just check`. Verify project reconciliation, admission, image pulls, pod readiness, Service backends, production certificate issuance, and trusted external HTTPS. Exercise rendered website routes and static assets, then connect two real WebSocket clients to confirm room membership and cursor updates. Verify an unknown route or invalid presence message fails without affecting healthy clients.

Record source commits, image digests, public probe results, and remaining gaps in Sable issue `sable-ned`. Roll back subsequent releases through Git deployment reverts. Before enabling the initial deployment, record the absence of a healthy legacy target; reverting this first release can restore the prior unserved state but cannot recover a legacy site that is no longer running.

## Approval

The user approved this design and explicitly authorized committing, pushing, and merging the scoped changes in both repositories. The user also approved native execution of the implementation plan and the live cutover.
