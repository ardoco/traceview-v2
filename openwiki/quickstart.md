# OpenWiki quickstart

TraceView is a Next.js/React frontend for ARDoCo traceability link recovery. It lets a user create a project, upload architecture/documentation/code artifacts, send them to an ARDoCo backend, and inspect the returned trace links and inconsistencies in a multi-panel viewer.

## What this repository does

- Provides the browser UI for starting and reviewing ARDoCo traceability runs.
- Supports a guided project creation flow with file upload, project details, configuration, and summary steps.
- Polls the backend for asynchronous results and renders trace links, documentation, architecture models, code models, and inconsistency findings.
- Stores project files and metadata locally in the browser for follow-up views.

The repository README describes the same product framing and confirms the supported pipelines and no-installation workflow for ARDoCo. See `README.md` and `src/app/page.tsx`.

## Major sections

- [Architecture](architecture.md) — app structure, routing, state, and backend integration
- [Workflows](workflows.md) — user journeys from the home page through result review
- [Domain model](domain.md) — traceability concepts, file types, and supported pipeline combinations
- [Operations](operations.md) — development, build, Docker, and CI notes

## Best starting points in source

- `src/app/page.tsx` — landing page and entry path into the wizard
- `src/app/new-project/page.tsx` — file-type gate and project setup entry
- `src/components/multiStepForm/MultiStepFormNewProject.tsx` — submission flow and navigation
- `src/app/view/[id]/page.tsx` — result polling and result viewer bootstrap
- `src/util/ArdocoApi.tsx` — request construction for the ARDoCo backend

## Repository shape

- `src/app/` holds the Next.js app router pages.
- `src/components/` contains form, viewer, and shared UI components.
- `src/contexts/` contains client-side state providers for API address, navigation, highlighting, and upload state.
- `src/util/` contains API and browser storage helpers.
- `.github/workflows/` contains build and Docker CI automation.
- `test/` currently contains a sample SAD/SAM JSON fixture used for local testing or examples.

## Development commands

From `package.json`:

```bash
npm install
npm run dev
npm run build
npm run lint
```

The project uses `next dev`, `next build`, `next start`, and `next lint --fix`.

## Notes for future changes

- Traceability pipeline behavior is centralized in `src/util/ArdocoApi.tsx`; change request payload rules there first.
- The result page is asynchronous and polls until the backend returns `OK`, so result-handling changes must preserve the accepted/polling path in `src/app/view/[id]/page.tsx`.
- File-type validation and allowed file combinations are controlled by the upload form context and trace-link type definitions.
- Result rendering is split by artifact type under `src/components/traceLinksResultViewer/views/`.
