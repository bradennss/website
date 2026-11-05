# Sable migration implementation plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task by task. Beads issue `sable-ned` tracks status; this document is an implementation reference.

**Goal:** Serve the unchanged website and live presence at `https://braden.lol` through Sable with durable GitOps delivery.

**Architecture:** The website repository owns restricted workloads, internal Services, and GHCR image publication. The Sable repository owns namespace provisioning, isolation, Flux registration, external routing, and certificate issuance. Release immutable image digests through a deployment pull request.

**Tech stack:** Next.js, Node.js, uWebSockets.js, pnpm, GitHub Actions, GHCR, Kustomize, K3s, Flux, Traefik, cert-manager.

**Spec:** `docs/superpowers/specs/2026-11-05-sable-migration-design.md`

## Global constraints

- Preserve existing content, application routes, and live cursor presence.
- Use `workload` and `automountServiceAccountToken: false` for every project pod.
- Keep two web replicas and one presence replica; retain resource limits and restricted contexts.
- Keep `PRESENCE_SERVER_URL=wss://braden.lol/presence`.
- Never place platform credentials in project CI or plaintext tracked files.
- Do not retire infrastructure, reinstall the host, or alter unrelated services.
- Commit, push, and merge scoped changes only, as explicitly approved by the user.

## Review focus

- Both `/presence` and `/presence/` must reach the presence server's `/` WebSocket handler.
- Unauthenticated image pulls must work, or a deliberately provisioned pull secret must exist before rollout.
- Reconciliation must use project permissions, not operator privileges.
- Invalid binary or text presence messages must not break other clients.
- Website HTML, static assets, and secondary routes must work with a trusted production certificate.

## Task 1: Website delivery and workload contract

**Files:** Modify `.github/workflows/build-and-push.yaml`, `deploy/workloads.yaml.eta`, `deploy/production/workloads.yaml`, `deploy/production/kustomization.yaml`, and `tooling/deployment/src/render.test.ts`; create `deploy/production/services.yaml`.

**Interface:** Internal Services `web:3000` and `presence:3000`, each selecting its same-named application label. CI publishes `ghcr.io/bradennss/website/web` and `ghcr.io/bradennss/website/presence` and proposes immutable manifest changes.

1. Add rendering regressions asserting no project ServiceAccounts, `serviceAccountName: workload`, token mounting disabled for both Deployments, retained singleton presence strategy, and correct environment/image interpolation. Run `pnpm --filter @braden-lol/deployment-tooling test` and confirm the contract assertions fail against the current template.
2. Remove Harbor identities from the template; add internal Services and the restricted workload identity settings. Regenerate production workloads using the existing image values until CI supplies GHCR digests. Rerun focused tests and `kubectl kustomize deploy/production`.
3. Adapt image publication to GHCR with `GITHUB_TOKEN` and `packages: write`; replace the direct main push with a release branch and deployment PR. Preserve two image build jobs, digest artifacts, and stale-source protection. Check repository Actions PR permissions before enabling publication.
4. Run repository lint, format, typecheck, tests, build, and manifest rendering. Review the full diff and commit the website migration on an isolated branch.

## Task 2: Operator-owned registration and routes

**Files in Sable:** Create `projects/website/provisioning/{namespace,rbac,limits,network,kustomization}.yaml`, `projects/website/reconciliation/{source,kustomization}.yaml`, `projects/website/endpoints/{web,kustomization}.yaml`, and `projects/website/reconciliations.yaml`; modify `clusters/sable/projects/kustomization.yaml`

**Interface:** Namespace `website`, restricted `workload` and `reconciler` identities; public `braden.lol` routes refer to Task 1's Services. Flux reads public `https://github.com/bradennss/website`, branch `main`, path `./deploy/production`.

1. Read Sable's approved implementation plan, admission policies, endpoint allocation checks, and reconciliation ordering examples before editing. Use existing Sable rendering, schema, and allocation checks for project registration, dependency ordering, and public hostname ownership. Do not add external-project tests to Sable. Verify the presence prefix rewrite through the live public WebSocket path.
2. Copy and adapt the explicit project provisioning examples to namespace `website`. Add ordered Flux provisioning, source, and endpoint reconciliation; workloads must not run before provisioning succeeds. Start project delivery suspended until published images are pullable.
3. Add explicitly public website ingress and presence routing with a Traefik prefix-strip middleware. Test `/presence` and `/presence/` semantics. Use the documented staging HTTP-01 issuer initially.
4. Run the existing unit suite and `just check`. Review the full diff, commit, and publish the operator registration changes using a scoped branch and PR.

## Task 3: Publish, reconcile, and verify the live outcome

**Files:** Update generated `deploy/production/workloads.yaml` through the release PR; update Sable's endpoint issuer after staging validation and source suspension after image readiness. Add a concise operator/deployer handoff to the website documentation.

1. Merge the website source migration, observe both real Actions image builds, and inspect the deployment PR's exact digests. Verify registry access without logging credentials. Provision encrypted project pull credentials only if public pulling is unavailable and suitable scoped credentials exist.
2. Merge the deployment PR and Sable registration. Enable project reconciliation only after provisioning and image access succeed. Observe Flux applied revisions, readiness, events, and Service endpoints through trusted operator SSH. Do not bypass TLS verification to repair the stale local kubeconfig.
3. Verify staging issuance, change the endpoint to production HTTP-01, and wait for its certificate Ready condition. Confirm public HTTPS with normal certificate verification. Preserve existing DNS if it still resolves correctly.
4. Exercise the public website in a browser, inspect HTML/static asset and secondary-route responses, then connect two real WebSocket clients and assert join counts and cursor updates for `/presence` and `/presence/`. Send an invalid message from an isolated client and assert healthy peers still exchange updates. Check unknown routes and continued protection of a platform dashboard.
5. Run required final checks and inspect both complete diffs. Record source commits, digests, successful and blocked scenarios, cleanup, and rollback limitations in `sable-ned` and the handoff. Close the issue only after the live verification passes; leave unrelated infrastructure and old credentials untouched.
