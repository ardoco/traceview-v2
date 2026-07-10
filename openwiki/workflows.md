# Workflows

This repository's user journeys are centered on one main flow: create a project, upload the relevant artifacts, submit to ARDoCo, and inspect the results.

## 1. Landing page to project creation

The home page in `src/app/page.tsx` introduces ARDoCo Trace View and sends the user to `/new-project` through the primary Start button.

The landing page is intentionally simple: it frames the product as a traceability and consistency-analysis UI and routes users into the wizard.

## 2. Guided project setup

`src/app/new-project/page.tsx` wraps the upload wizard in `FormProvider` and filters allowed file types to exclude trace-link and inconsistency result files from the initial upload flow.

`src/components/multiStepForm/MultiStepFormNewProject.tsx` implements the four-step process:

1. Upload Files
2. Project Details
3. Configuration
4. Summary

The wizard validates each step before allowing progress. The last step submits the payload to the backend and redirects to `/view/{requestId}` with query parameters for the selected trace-link type and the inconsistencies toggle.

## 3. Request construction and submission

`src/util/ArdocoApi.tsx` is the canonical place for submission rules. It builds the multipart payload based on the chosen trace-link type:

- SAD-SAM-Code requires code, documentation, and an architecture model.
- SAD-Code requires code and documentation.
- SAM-Code requires code and an architecture model.
- SAD-SAM requires documentation and an architecture model.

If the user enables inconsistency detection, the code restricts that path to SAD-SAM and uses the dedicated `/api/find-inconsistencies/start` endpoint.

The upload context also fetches backend configuration from `/api/configuration`, so configuration is available during the wizard.

## 4. Result polling and display

`src/app/view/[id]/page.tsx` handles the asynchronous response lifecycle. It repeatedly polls `/api/get-result/{id}` until the backend responds with `OK`.

While waiting, the page shows a loading banner. If the backend returns an error, the page surfaces a modal with retry and fallback options.

Once data arrives, the page:

- parses trace links
- optionally parses inconsistencies
- sets the current project ID in navigation context
- renders the `ResultDisplay`

## 5. Multi-panel result exploration

`src/components/traceLinksResultViewer/ResultDisplay.tsx` renders up to three panels side by side using `react-resizable-panels`.

The result viewer supports:

- cross-artifact highlighting
- fullscreen per-view exploration
- a separate inconsistencies view when requested
- trace-link search/result messaging

This area is the main UX for inspecting recovered links across documentation, architecture, and code.

## 6. Stored/provided project path

There is a parallel result route under `src/app/view-provided/[id]/page.tsx`. The presence of this route suggests a fallback or stored-project viewing path, but its exact business meaning should be verified against future source changes before documenting it more deeply.

## Things to watch when changing workflows

- Preserve the query parameters passed from submission to the result page; they determine which result views are enabled.
- Keep the inconsistency path aligned with the trace-link type restrictions in `src/util/ArdocoApi.tsx` and `src/contexts/ProjectUploadContext.tsx`.
- If step order or validation changes, update both the wizard component and the explanatory copy on the home page and quickstart.
