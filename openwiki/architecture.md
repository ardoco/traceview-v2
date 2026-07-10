# Architecture

TraceView is a client-heavy Next.js app built with the App Router. The UI is organized around three core areas: project creation, backend submission/polling, and result visualization.

## Top-level application structure

- `src/app/page.tsx` is the landing page. It introduces the product and links to the new-project flow.
- `src/app/new-project/page.tsx` mounts the multi-step upload wizard and limits which file types can be uploaded.
- `src/app/view/[id]/page.tsx` polls for a completed traceability result and then renders the result viewer.
- `src/app/view-provided/[id]/page.tsx` exists as an alternate result path for stored/provided projects.
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

This structure keeps the UI independent from the actual backend host while still requiring a configured target API address.

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

The form uses `src/util/ClientFileStorage.tsx` to persist project artifacts locally after submission, which supports later review flows.

## Important implementation conventions

- Most components are marked `'use client'`, so changes must respect client-side rendering constraints.
- The project uses the `@/*` import alias configured in `tsconfig.json`.
- The codebase prefers explicit file-type discriminants in `src/components/dataTypes/` for validation and backend request building.
- `react-resizable-panels` is central to the result viewer layout, so panel-level changes should be tested for resize/collapse behavior.

## Where to start when changing the architecture

- For routing or page-level behavior, start in `src/app/`.
- For upload state or form rules, start in `src/contexts/ProjectUploadContext.tsx` and `src/components/multiStepForm/`.
- For backend request or polling logic, start in `src/util/ArdocoApi.tsx` and `src/app/view/[id]/page.tsx`.
- For result visualization, start in `src/components/traceLinksResultViewer/`.
