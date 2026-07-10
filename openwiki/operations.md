# Operations

This page covers the practical setup, validation, and CI details that matter when working in the repository.

## Local development

From `package.json` and the README:

```bash
npm install
npm run dev
```

The app runs on the Next.js dev server and is expected to be opened at `http://localhost:3000`.

## Production build and run

From `package.json`:

```bash
npm run build
npm start
```

Next configuration sets `output: 'standalone'` in `next.config.ts`, which is relevant for container builds and deployable artifacts.

## Linting

The repo defines:

```bash
npm run lint
```

This currently invokes `next lint --fix` from `package.json`. That is worth preserving or reviewing carefully if lint automation changes, because it implies autofix behavior rather than read-only linting.

## Docker

The README documents a standard Docker flow:

```bash
docker build -t traceview2 .
docker run -p 3000:3000 traceview2
```

It also references `docker-compose-template.yml` as the starting point for Compose-based local runs.

## CI

The repository contains three relevant workflows in `.github/workflows/`:

- `verify.yml` — checks out the repo, installs Node, and runs `npm install` followed by `npm run build`
- `docker.yml` — container-oriented automation
- `openwiki.yml` — documentation automation added for this repo

`verify.yml` is the most important gate for code changes because it mirrors the build step.

## Test and fixture material

The `test/` directory currently contains `test-sadsam-json.json`, which appears to be a sample data fixture rather than a broad test suite.

There is no evidence in the inspected files of a dedicated unit/integration test harness beyond build verification, so future contributors should confirm whether additional tests exist before relying on them.

## Operational dependencies and risks

- The application depends on an ARDoCo backend reachable through the configured API address.
- Result polling can wait up to several minutes before timing out, so long-running backend jobs are part of normal operation.
- Browser storage is used for project metadata and files, so clearing local storage will affect the provided-project flow.

## When changing operations-related code

- Update both the README and the OpenWiki operations notes if build or run commands change.
- Keep CI aligned with the same Node/npm assumptions used locally.
- Re-run the build after touching route, context, or request-building code, since those changes can break the deployment artifact even if the UI still compiles locally.
