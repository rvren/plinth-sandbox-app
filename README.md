# plinth sandbox app — Meridian (synthetic)

A copy of plinth's demo application, **Meridian** — an invented compute platform. Everything in
it (organisations, metrics, people) is made up. It exists so plinth's pull-request flow can be
tested end to end against a real GitHub repository: plinth scans this code, and when a change
proven with users is made permanent, it opens a **draft** pull request here that rewrites the
dashboard's default order in `src/catalog/specs.ts`.

The CI check (`.github/workflows/check.yml`) makes sure the dashboard's order still lists every
panel exactly once. Nothing here is built or deployed.
