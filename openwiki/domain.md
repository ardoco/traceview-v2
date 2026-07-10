# Domain model

TraceView operates in the ARDoCo traceability domain. The application is less about generic file upload and more about combining specific software engineering artifacts into traceability and inconsistency-analysis runs.

## Core artifact types

The app distinguishes a small number of file types in `src/components/dataTypes/`:

- documentation / SAD
- architecture model / SAM, with both PCM and UML variants
- code model
- trace-links output
- inconsistencies output

These types are used both in the upload wizard and in result rendering, so they are a central domain concept rather than a UI detail.

## Trace-link pipeline combinations

The supported pipeline combinations are visible in the README and enforced by `src/util/ArdocoApi.tsx`:

- SAD-SAM-Code (`SAD_SAM_CODE`)
- SAD-Code (`SAD_CODE`)
- SAM-Code (`SAM_CODE`)
- SAD-SAM (`SAD_SAM`)

Each pipeline has its own required input set and backend start endpoint. The UI should not be treated as accepting arbitrary combinations of documents; the request builder validates the supported combinations explicitly.

## Inconsistency analysis

The product also surfaces inconsistency findings, described in the README as TEAM and MEAT results.

At the code level, the workflow is intentionally narrow:

- inconsistency detection is only enabled for the SAD-SAM trace-link type
- the result view optionally includes an inconsistencies panel
- the result page parses inconsistency JSON only when requested and present

This means inconsistency handling is a feature layered on top of a specific trace-link mode, not a separate universal mode.

## Project and result identity

A project is identified by a request/result ID returned by the backend. That ID is used to:

- redirect from submission into the result view
- poll for completion
- load stored local file metadata for later navigation

The ID is URI-encoded when inserted into routes, which matters if future changes alter how project IDs are generated or displayed.

## User-facing concepts to keep stable

- A project is a traceability run, not just a folder of uploads.
- The user chooses one supported trace-link type, not an arbitrary backend job.
- Architecture models may come in PCM or UML form, but both are treated as architecture-model inputs.
- The result viewer is centered on side-by-side comparison across artifact types.

## Source of truth for domain rules

- `README.md` for product description and supported pipelines
- `src/components/dataTypes/` for file and result type definitions
- `src/util/ArdocoApi.tsx` for pipeline validation and request assembly
- `src/components/traceLinksResultViewer/views/` for result domain models and parsers
