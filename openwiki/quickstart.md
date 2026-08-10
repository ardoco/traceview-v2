---
type: "Reference"
title: "OpenWiki quickstart"
description: "Entry point for the TraceView wiki: what the app does, how the docs are organized, where to start in source, and how to run it."
tags: [traceview, quickstart, navigation]
openwiki:
  roles: [repository, architecture]
  change_kinds: [navigation]
  source_paths: [src/app/page.tsx, src/components/NavBar.tsx, package.json]
  validation_commands: ["npm run build"]
---

# OpenWiki quickstart

TraceView is a Next.js/React frontend for ARDoCo traceability link recovery. It lets a user create a project, upload architecture/documentation/code artifacts, send them to an ARDoCo backend, and inspect the returned trace links and inconsistencies in a multi-panel viewer. A second entry point, "Load Project", lets a user visualize pre-computed trace links stored locally without invoking the backend.

## What this repository does

- Provides the browser UI for starting and reviewing ARDoCo traceability runs.
- Supports a guided project creation flow with file upload, project details, configuration, and summary steps.
- Polls the backend for asynchronous results and renders trace links, documentation, architecture models, code models, and inconsistency findings.
- Stores project files and metadata locally in the browser for follow-up views.

The repository README describes the same product framing and confirms the supported pipelines and no-installation workflow for ARDoCo. See `README.md` and `src/app/page.tsx`.

## Major sections

- [Architecture](architecture.md) — app structure, routing, state, and backend integration
- [Workflows](workflows.md) — user journeys from the home page and NavBar through result review, including the new-project and load-project flows
- [Domain model](domain.md) — traceability concepts, file types, and supported pipeline combinations
- [Operations](operations.md) — development, build, Docker, and CI notes

## Best starting points in source

- `src/components/NavBar.tsx` — top navigation exposing New Project and Load Project entry points
- `src/app/page.tsx` — landing page and entry path into the new-project wizard
- `src/app/new-project/page.tsx` — file-type gate and project setup entry
- `src/app/load-project/page.tsx` — entry for loading an existing project with pre-computed trace links
- `src/components/multiStepForm/MultiStepFormNewProject.tsx` — new-project submission flow and navigation
- `src/components/multiStepForm/MultiStepFormLoadProject.tsx` — load-project flow that stores files locally and redirects to the provided result view
- `src/app/view/[id]/page.tsx` — result polling and result viewer bootstrap for new-project runs
- `src/app/view-provided/[id]/page.tsx` — loads stored files and renders the same viewer for loaded projects
- `src/util/ArdocoApi.tsx` — request construction for the ARDoCo backend

## Repository shape

- `src/app/` holds the Next.js app router pages, including `/new-project`, `/load-project`, `/view/[id]` (polling result view), and `/view-provided/[id]` (stored result view).
- `src/components/` contains the NavBar, form, viewer, and shared UI components.
- `src/contexts/` contains client-side state providers for API address, navigation, highlighting, and upload state.
- `src/util/` contains API and browser storage helpers (`ClientFileStorage.tsx` persists project artifacts locally for the load-provided flow).
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
