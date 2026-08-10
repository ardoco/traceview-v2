---
type: "Reference"
title: "Architecture"
description: "TraceView app structure: Next.js App Router routes, React contexts, backend integration via proxy API routes, multi-panel result viewer, and the two submission/storage flows."
tags: [traceview, architecture, routing, state]
openwiki:
  roles: [architecture, integration]
  change_kinds: [routing, lifecycle]
  source_paths: ["src/app/layout.tsx", "src/app/page.tsx", "src/app/new-project/page.tsx", "src/app/load-project/page.tsx", "src/app/view/[id]/page.tsx", "src/app/view-provided/[id]/page.tsx", "src/contexts/ProjectUploadContext.tsx", "src/util/ArdocoApi.tsx", "src/util/ClientFileStorage.tsx"]
  validation_commands: ["npm run build"]
---

# Architecture

TraceView is a client-heavy Next.js app built with the App Router. The UI is organized around three core areas: project creation, backend submission/polling, and result visualization. Project creation has two variants — a new-project flow that submits to ARDoCo, and a load-project flow that visualizes pre-computed trace links stored locally.

## Top-level application structure

- `src/app/page.tsx` is the landing page. It introduces the product and links to the new-project flow.
- `src/components/NavBar.tsx` provides the persistent top navigation, exposing New Project (`/new-project`), Load Project (`/load-project`), and external About/GitHub links.
- `src/app/new-project/page.tsx` mounts the multi-step upload wizard and limits which file types can be uploaded.
- `src/app/load-project/page.tsx` mounts the load-project wizard, which accepts pre-computed trace-link (and optional inconsistency) files and stores them locally for viewing.
- `src/app/view/[id]/page.tsx` polls for a completed traceability result and then renders the result viewer.
- `src/app/view-provided/[id]/page.tsx` is the result path for loaded projects: it reads stored files from `ClientFileStorage` instead of polling the backend and renders the same `ResultDisplay`.
- `src/app/layout.tsx` and `src/app/globals.css` provide the application shell and global styling.

The app uses `pageExtensions` set in `next.config.ts` to support `.tsx`, `.ts`, and `.mdx` pages.

## Client-side state and coordination

The repository leans on React contexts to avoid prop drilling across deeply nested UI trees:

- `src/contexts/ApiAddressContext.tsx` holds the target ARDoCo backend address.
- `src/contexts/ProjectUploadContext.tsx` manages the wizard form state, including project name, selected trace-link type, uploaded files, trace-link configuration, and the inconsistencies toggle.
- `src/contexts/NavigationContext.tsx` tracks the current project ID during result navigation.
- `src/contexts/HighlightTracelinksContextType.tsx` and `src/contexts/HighlightInconsistencyContext.tsx` coordinate cross-panel highlighting in the result viewer.

The upload context fetches default trace-link configuration from `/api/configuration` using the backend address from the API context.

## Backend integration pattern

The browser talks to ARDoCo through local API routes that forward requests to a target backend using the `X-Target-API` header.

Key client-side integration code lives in:

- `src/util/ArdocoApi.tsx` — constructs multipart form submissions for the supported trace-link pipelines and validates required file combinations.
- `src/app/view/[id]/page.tsx` — polls `/api/get-result/{id}` until the backend returns `OK`.
- `src/contexts/ProjectUploadContext.tsx` — fetches configuration before the form is used.

This structure keeps the UI independent from the actual backend host while still requiring a configured target API address. The load-project flow intentionally bypasses this layer: it stores files locally and renders them via the same viewer without a backend round trip.

## Rendering model

The result area is built as a multi-panel viewer:

- `src/components/traceLinksResultViewer/ResultDisplay.tsx` renders up to three resizable panels.
- `src/components/traceLinksResultViewer/ResultPanel.tsx` and related view components show the selected artifact types.
- `src/components/traceLinksResultViewer/views/documentation`, `views/architectureModel`, `views/codeModel`, `views/tracelinks`, and `views/inconsistencies` each own their own parser, data model, and viewer logic.

Result-specific data is parsed before rendering so the display layer can work with typed view models instead of raw backend payloads.

## Form and submission flow

`src/components/multiStepForm/MultiStepFormNewProject.tsx` is the core orchestration component for project creation. It wires together:

- step navigation and validation
- file upload and metadata capture
- configuration editing
- submission to ARDoCo
- browser-side storage of selected files and metadata

The form uses `src/util/ClientFileStorage.tsx` to persist project artifacts locally after submission, which supports later review flows. The stored artifacts are also what the load-project flow visualizes.

`src/components/multiStepForm/MultiStepFormLoadProject.tsx` is the parallel orchestration component for loading an existing project. It reuses the same upload context and `ClientFileStorage` helpers, but has a single step: it validates that a project name, trace-link type, and files are present, generates a UUID storage ID client-side, stores the files and metadata, and redirects to `/view-provided/{id}`. It does not call ARDoCo.

## Important implementation conventions

- Most components are marked `'use client'`, so changes must respect client-side rendering constraints.
- The project uses the `@/*` import alias configured in `tsconfig.json`.
- The codebase prefers explicit file-type discriminants in `src/components/dataTypes/` for validation and backend request building.
- `react-resizable-panels` is central to the result viewer layout, so panel-level changes should be tested for resize/collapse behavior.

## Where to start when changing the architecture

- For routing or page-level behavior, start in `src/app/`.
- For navigation surface, start in `src/components/NavBar.tsx`.
- For upload state or form rules, start in `src/contexts/ProjectUploadContext.tsx` and `src/components/multiStepForm/` (both the new-project and load-project forms).
- For backend request or polling logic, start in `src/util/ArdocoApi.tsx` and `src/app/view/[id]/page.tsx`.
- For local file persistence and the provided-result view, start in `src/util/ClientFileStorage.tsx` and `src/app/view-provided/[id]/page.tsx`.
- For result visualization, start in `src/components/traceLinksResultViewer/`.
