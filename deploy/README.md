# Deploy the website on Sable

## Ownership

This repository owns the web and presence Deployments and their internal Services under `deploy/production`. Sable owns the `website` namespace, workload identities, resource and network policies, Flux registration, certificates, and public routes. Operator configuration lives under `projects/website` in the private Sable repository.

Both Deployments use the operator-provisioned `workload` service account with API token mounting disabled. The web service runs two replicas on port 3000. Presence runs one replica on port 3000 because its rooms and cursor state are process-local. A presence restart disconnects clients and clears that transient state; browsers reconnect automatically.

## Release

1. Merge application changes to `main`, or manually run the **Build and Push** workflow.
2. Wait for both image builds and publication to GHCR. CI uses the repository's `GITHUB_TOKEN`; it does not need cluster or platform credentials.
3. Review the generated deployment pull request. It updates both images in `deploy/production/workloads.yaml` to immutable digests. Merge it to release.
4. Wait for Flux to reconcile `./deploy/production`. Ask the operator for project reconciliation and pod readiness if the rollout fails.
5. Verify `https://braden.lol/` and `https://braden.lol/api/health`. Open the homepage in two browser tabs and confirm that the presence count updates and cursor movement reaches the other tab.

Keep the repository variable `PRESENCE_SERVER_URL` set to `wss://braden.lol/presence`. GitHub Actions must be allowed to create pull requests. Workflow-created deployment pull requests might not trigger checks under GitHub's token rules; inspect their diff and render the manifests before merging.

The operator routes `/` to `web:3000` and `/presence` to `presence:3000`. A Traefik middleware rewrites `/presence` and `/presence/` to the presence server's `/` handler. The endpoint is public and requires no Authentik session. cert-manager manages its production Let's Encrypt certificate through HTTP-01, so port 80 must remain reachable for challenge requests.

The deployed GHCR packages permit anonymous pulls. If package access changes, coordinate an operator-managed pull secret rather than adding registry credentials to source files. The former Harbor variables and secrets are unused by this workflow; removing them is a separate credential-retirement operation.

## Roll back

Revert the deployment commit that changed the image digests and merge the revert. Flux restores the previous desired release. Do not rely on a manual live image change; reconciliation overwrites it. The initial migration had no running legacy website to restore, so retain the first healthy GHCR digests as the starting rollback point.

## Migration acceptance

The November 5, 2026 cutover used application source `bd4e1672f91ac6c61e17ce7a1acdefbd861da33b` and deployment revision `d30b4519cc2d864665f49228e938da308c4c1ef3`:

- Web: `ghcr.io/bradennss/website/web@sha256:2684fe9d9a291275bf896e5d78ee727ad6e32a3f9e55a03e3854a43ce3fb8bae`.
- Presence: `ghcr.io/bradennss/website/presence@sha256:17f0eeca86408a60832f6b426b884b6fb05756d6dba91c4c4f94feef579f38ba`.
- Both real CI image builds succeeded, the generated digest pull request merged, and anonymous registry access succeeded.
- Staging and production HTTP-01 issuance succeeded. External clients verified trusted HTTPS without a certificate bypass.
- Flux reported the project Ready; both web replicas and the presence replica were Ready with no restarts. All platform reconciliations remained Ready.
- Chrome verified homepage rendering, work-page navigation, the Tiny Tanks project page, 46 static-asset responses, two-browser presence, and an unknown route's HTTP 404. No page errors or failed resource responses occurred in the final browser run.
- Real WebSocket clients verified both presence URL forms, two-client room membership, bidirectional cursor updates, rejection of text and malformed binary messages, and continued healthy-peer operation.
- Anonymous Grafana access continued to redirect to Authentik.

The cutover required no DNS changes because the apex already resolved to Sable. It did not retire infrastructure, remove old credentials, test IPv6, or restore a legacy deployment. The saved local operator kubeconfig had stale trust material; live operator checks used the pinned SSH identity and the host's `k3s kubectl`, without disabling TLS verification.

Keep application and project-specific deployment tests in this repository. Sable's tests cover reusable platform behavior; project acceptance evidence belongs here or in the onboarding issue.
