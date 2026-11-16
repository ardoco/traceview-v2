---
type: "Reference"
title: "Cross-panel highlighting"
description: "The cross-panel highlight engine: the two React highlight contexts, matching semantics per DisplayOption, MessageSource and timestamp arbitration behind the results toast, and the click paths that propagate a selection across all five viewer panels."
tags: [architecture, react-contexts, highlighting, trace-links, inconsistencies, result-viewer]
verified:
  - by: openwiki/0.9.0
    at: 2026-11-16T15:06:02.471Z
sources:
  - id: openwiki-source-0bcc48eb44982dd51d08550d
    resource: repo://src/app/globals.css
  - id: openwiki-source-a1639c9a3e7858fc041e3486
    resource: repo://src/app/view-provided/%5Bid%5D/page.tsx
  - id: openwiki-source-480c0862686116627e432a75
    resource: repo://src/app/view/%5Bid%5D/page.tsx
  - id: openwiki-source-528c561e852e3391c321e307
    resource: repo://src/components/dataTypes/MessageSource.tsx
  - id: openwiki-source-f0d65a88f2f7215f2be0bf06
    resource: repo://src/components/traceLinksResultViewer/ResultDisplay.tsx
  - id: openwiki-source-e359bc4b77781eac3fece3db
    resource: repo://src/components/traceLinksResultViewer/SearchResultMessage.tsx
  - id: openwiki-source-132533efc1e0e81e149c8a82
    resource: repo://src/components/traceLinksResultViewer/views/architectureModel/viewer/UMLComponentNode.tsx
  - id: openwiki-source-6518434bb402eed18d45dd92
    resource: repo://src/components/traceLinksResultViewer/views/architectureModel/viewer/UMLEdge.tsx
  - id: openwiki-source-4fe24389cf20d047fbabab78
    resource: repo://src/components/traceLinksResultViewer/views/architectureModel/viewer/UMLInterface.tsx
  - id: openwiki-source-2e270af2183b43751f8f4ecb
    resource: repo://src/components/traceLinksResultViewer/views/codeModel/viewer/ACMNode.tsx
  - id: openwiki-source-1dde74109270872036282d91
    resource: repo://src/components/traceLinksResultViewer/views/codeModel/viewer/ACMViewer.tsx
  - id: openwiki-source-e0a0b2a2b7440cffaae96f5a
    resource: repo://src/components/traceLinksResultViewer/views/documentation/viewer/SentenceView.tsx
  - id: openwiki-source-41b0ddd38875cb836d4dd37b
    resource: repo://src/components/traceLinksResultViewer/views/inconsistencies/dataModel/Inconsistency.tsx
  - id: openwiki-source-6004e2ba1c0c4d04564771d5
    resource: repo://src/components/traceLinksResultViewer/views/inconsistencies/viewer/InconsistencyItemDisplay.tsx
  - id: openwiki-source-acf6552bed288cce9f7945c6
    resource: repo://src/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink.tsx
  - id: openwiki-source-733bfb40a14cc2c69489961b
    resource: repo://src/components/traceLinksResultViewer/views/tracelinks/TracelinkViewer.tsx
  - id: openwiki-source-09af9418aec786d0807b8f0c
    resource: repo://src/components/traceLinksResultViewer/views/tracelinks/viewer/TraceLinkItem.tsx
  - id: openwiki-source-7ca400e26edcc629b015aceb
    resource: repo://src/contexts/HighlightInconsistencyContext.tsx
  - id: openwiki-source-fcb2dc03c3b7dc92e44ab5f6
    resource: repo://src/contexts/HighlightTracelinksContextType.tsx
generated: { by: "openwiki/0.9.0", at: "2026-11-16T15:06:02.471Z" }
---

# Cross-panel highlighting

The result viewer's central interaction is **cross-panel highlighting**: clicking a sentence, a model element, a code element, a trace link, or an inconsistency highlights everything related to that selection in every other panel. The engine is deliberately small — two React contexts own the highlight state, a shared vocabulary of `DisplayOption` and `MessageSource` values ties the panels together, and a toast summarizes each selection — while the five view modules under `src/components/traceLinksResultViewer/views/` (`documentation`, `architectureModel`, `codeModel`, `tracelinks`, `inconsistencies`) only read state and emit clicks. The panel layout itself is covered in [Result viewer](result-viewer.md); how the contexts get their data is covered in [Architecture](../architecture.md).

## Ownership: two contexts, one selection-origin marker

| Context | File | Owns | Also exposes |
| --- | --- | --- | --- |
| `HighlightProvider` | `src/contexts/HighlightTracelinksContextType.tsx` | `highlightedTraceLinks`, `lastSearchTimestamp`, `messageSource`, the `lastClickedSource` marker and its setter | pass-through `traceLinks`, `traceLinkType`, `loading` |
| `InconsistencyProvider` | `src/contexts/HighlightInconsistencyContext.tsx` | `highlightedInconsistencies` (plus derived sentence/model partitions), its own `lastSearchTimestamp`, `messageSource` | pass-through `inconsistencies`, `loading`, `error` |

`lastClickedSource` — the visual *selection origin* — is owned **only** by `HighlightProvider`. `InconsistencyProvider` calls `useHighlightContext()` inside its own provider body and borrows exactly one thing: `setLastClickedSource`. The borrow grants **write access to the whole marker object** — the inconsistency engine writes `{id, type}` pairs such as `{sentenceNumber, DOCUMENTATION}` into the trace-link context's state. It grants no read access: `InconsistencyProvider`'s context value does not expose `lastClickedSource` at all, so inconsistency panel items obtain the marker from `useHighlightContext()` directly, and `resetHighlightedInconsistencies` cannot clear it (see below). This dependency is why both result routes nest the providers as `HighlightProvider → InconsistencyProvider` — the inconsistency context is a *consumer* of part of the trace-link context, not a sibling.

`DisplayOption` (`src/components/dataTypes/DisplayOption.tsx`) is the panel vocabulary both contexts speak: `TRACELINKS`, `CODE_MODEL`, `ARCHITECTURE_MODEL`, `DOCUMENTATION`, `INCONSISTENCIES`. Every highlight function and every origin marker is tagged with one of these values, so a marker written by one panel can only be claimed by the panel whose `DisplayOption` matches.

## Trace-link matching semantics (`HighlightProvider`)

`highlightElement(id, type)` is the element-click entry point. It scans `traceLinks` and matches by the identifier appropriate to the clicked panel:

| `type` | Trace link field matched |
| --- | --- |
| `DOCUMENTATION` | `traceLink.sentenceNumber` (guarded by truthiness of `sentenceNumber`) |
| `ARCHITECTURE_MODEL` | `traceLink.modelElementId` |
| `CODE_MODEL` | `traceLink.codeElementId` |

Comparisons use loose equality (`==`), so the `id` argument may be a number (sentence identifiers) or a string (model/code element ids) interchangeably. On any non-null call the provider sets `highlightedTraceLinks` to the matches — even when that is an empty array — and additionally stamps `lastSearchTimestamp = Date.now()`, sets `messageSource = PROVIDED_PROJECT_ELEMENT`, and records `{id, type}` as `lastClickedSource`. A click that matches nothing therefore still produces feedback (the toast reports "no trace links found.") rather than silence.

`highlightSingleTraceLink(traceLink)` is the trace-link row entry point: it highlights exactly that link, sets `messageSource = TRACELINK`, stamps the timestamp, and records `{id: traceLink.id, type: DisplayOption.TRACELINKS}` as the origin. `resetHighlightedTraceLinks()` clears the highlight set, resets `messageSource` to `NONE`, **and clears `lastClickedSource`**.

Two guards shape the lifecycle:

- **Empty-collection no-op.** All three mutators return immediately when `traceLinks` is empty, so a viewer rendered without parsed results (e.g. the "View Files Only" fallback) cannot create highlight state at all.
- **Null-id early return.** `highlightElement(null, type)` clears the highlight set and returns *before* touching the timestamp, message source, or origin marker — clearing via a null id is a quiet reset that does not count as a new search.

## Inconsistency matching semantics (`InconsistencyProvider`)

`InconsistencyProvider` partitions its `inconsistencies` prop by type on every render — no memoization: `sentenceInconsistencies` (`TextEntityAbsentFromModel`, keyed by `sentenceNumber`) and `modelInconsistencies` (`ModelEntityAbsentFromText`, keyed by `modelElementId`), plus the same two partitions computed over `highlightedInconsistencies` so panels can check "is *my kind* of inconsistency highlighted?" independently.

Three mutators, all no-ops when `inconsistencies` is empty:

- `highlightInconsistencyWithSentence(sentence)` filters `TextEntityAbsentFromModel` entries by `sentenceNumber`; `highlightInconsistencyWithModelId(modelElementId)` filters `ModelEntityAbsentFromText` entries by `modelElementId`. Both set `messageSource = PROVIDED_PROJECT_ELEMENT`, stamp the timestamp, and delegate `setLastClickedSource(...)` to the trace-link context — with `DOCUMENTATION` / `ARCHITECTURE_MODEL` respectively as the origin type. Because `filter` always returns an array, the `if (inconsistency)` guard never fails; a miss silently assigns an empty highlight set (the embedded `console.warn` branch is unreachable), which the toast then reports as "no inconsistencies found."
- `highlightSingleInconsistency(inconsistency)` is the inconsistency-row entry point: one item, `messageSource = INCONSISTENCY`, origin `{id: inconsistency.id, type: INCONSISTENCIES}` written through the borrowed setter.
- `resetHighlightedInconsistencies()` clears the highlight set and resets `messageSource` to `NONE`, but — unlike its trace-link counterpart — leaves `lastClickedSource` untouched, so the visual selection origin survives an inconsistency reset.

## MessageSource, lastSearchTimestamp, and the selection-origin marker

`MessageSource` (`src/components/dataTypes/MessageSource.tsx`) classifies *what triggered* the latest highlight and drives the shape of the toast message:

| Value | Meaning | Set by |
| --- | --- | --- |
| `TRACELINK` | a trace-link item was clicked | `highlightSingleTraceLink` |
| `INCONSISTENCY` | an inconsistency item was clicked | `highlightSingleInconsistency` |
| `PROVIDED_PROJECT_ELEMENT` | an element inside a panel (sentence, model element, code element) was clicked | `highlightElement`, `highlightInconsistencyWithSentence`, `highlightInconsistencyWithModelId` |
| `NONE` | initial state or after a reset | both `reset*` functions |

Each context keeps its own `lastSearchTimestamp` (initially `0`, then `Date.now()` on every non-reset mutator). The pair `(timestamp, messageSource)` is what drives `SearchResultMessage`'s re-renders: the toast recomputes its message whenever either context's timestamp, source, or highlight count changes, and the newer timestamp decides whose message is shown. State writes alone are not enough — a reset that only clears highlights without touching the timestamp keeps the previous messageSource, so the toast text only changes when a trigger actually publishes a new `(timestamp, source)` pair.

`lastClickedSource` is the cross-panel **selection-origin marker** and the focus coordinator: each clickable item compares `lastClickedSource.type` against its own `DisplayOption` and `lastClickedSource.id` against its own identifier, and renders a distinctive border/shadow/dash style when both match. That comparison is how every panel knows *which* element was clicked — the item that recognizes its own id in the marker shows the "you clicked here" style, while the other panels react only through the highlight sets. The ids being compared are the model classes' composite identifiers — `TraceLink.id` is `` `${modelElementId}-${codeElementId}-${sentenceNumber}` `` and `Inconsistency.id` is `` `${type}-${reason}-${sentenceNumber | modelElementId}` ``. Because the marker lives in the trace-link context but is written through the borrowed setter by both engines, the reset asymmetry matters in practice: `resetHighlightedTraceLinks` erases the marker (and with it the active source of the current selection), `resetHighlightedInconsistencies` does not.

## Toast arbitration (`SearchResultMessage`)

`SearchResultMessage` (`src/components/traceLinksResultViewer/SearchResultMessage.tsx`) is rendered once by `ResultDisplay`, outside the panels, and reads *both* contexts' `lastSearchTimestamp` and `messageSource`. Arbitration is purely by recency:

```ts
traceLinkTimestamp > inconsistencyTimestamp   → traceLinkSource wins (fallback TRACELINK)
inconsistencyTimestamp > traceLinkTimestamp   → inconsistencySource wins (fallback PROVIDED_PROJECT_ELEMENT)
tie + traceLinkTimestamp > 0                  → combined view (PROVIDED_PROJECT_ELEMENT)
tie + both zero                               → NONE (nothing to show)
```

The tie branch is not a corner case: element clicks call `highlightElement` and the matching inconsistency highlight synchronously in one handler, so both timestamps usually land in the same millisecond — the tie-break is exactly what turns such clicks into a combined message.

For `PROVIDED_PROJECT_ELEMENT` sources the toast composes one message from **both** counts — "2 trace links and 1 inconsistency found." — including only the counts whose panels are actually in `displayOptions` (with " and " inserted only when both parts are present). For `TRACELINK` / `INCONSISTENCY` sources only the respective count is shown, and only when the `TRACELINKS` / `INCONSISTENCIES` panel is displayed at all. Counts render as "no trace links" / "no inconsistencies", "1 trace link" / "1 inconsistency", or "N trace links" / "N inconsistencies", which is how a click that matched nothing still produces visible feedback. When a source's panel is not in `displayOptions`, no parts are produced and the toast stays hidden.

The toast auto-hides 2 seconds after the latest trigger (`setTimeout`, with the previous timer cleared on every new message), and each new message restarts the blink animation by removing the `animate-blink` class, forcing a reflow with `void el.offsetWidth`, and re-adding it inside `requestAnimationFrame` — otherwise a CSS animation already in its end state would not replay on repeated triggers. The `animate-blink` keyframes in `src/app/globals.css` are a 0.01 s opacity flash, so the visible effect is a short attention pulse rather than a continuous blink. (Quirk: the trace-link text span also carries the `animate-blink` class itself.) Message segments are color-coded with the same tokens the panels use (`text-highlight-tracelink-text` / `text-highlight-inconsistency-text`), and the toast itself is a fixed, bottom-centered overlay.

## Click origins and propagation rules

Clicks originate in five kinds of place and follow two distinct propagation rules:

| Origin | Handler calls | Resets the other engine? |
| --- | --- | --- |
| `TraceLinkItem` (tracelinks panel) | `resetHighlightedInconsistencies()` → `highlightSingleTraceLink(link)` | yes |
| `InconsistencyItemDisplay` (inconsistencies panel) | `resetHighlightedTraceLinks()` → `highlightSingleInconsistency(inc)` | yes |
| `SentenceView` (documentation panel) | `highlightElement(id, DOCUMENTATION)` + `highlightInconsistencyWithSentence(id)` | no — both run |
| `UMLComponentNode`, `UMLInterface`, `UMLEdge` lollipops (architecture panel) | `highlightElement(id, ARCHITECTURE_MODEL)` + `highlightInconsistencyWithModelId(id)` | no — both run |
| `ACMNode` (code panel, plain click) | `highlightElement(id, CODE_MODEL)` | no — trace links only |

The rule is: **list-item selections are mutually exclusive** (selecting a trace link clears inconsistency highlights and vice versa), while **element selections run both engines in parallel** with the same identifier, producing simultaneous trace-link and inconsistency highlights. The code panel has no inconsistency integration at all — consistent with the domain rule that inconsistency detection only exists for the SAD-SAM (documentation + architecture model) combination.

For `UMLInterface` and `UMLEdge` the "same identifier" passed to the inconsistency engine is the **interface id**, and it is passed where `highlightInconsistencyWithModelId` expects a *model element* id; the origin marker is likewise written as `{id: interfaceId, type: ARCHITECTURE_MODEL}`, which only component rectangles claim by their own id. So a lollipop click reliably drives the trace-link engine (trace links may reference interface element ids), but generally produces no inconsistency highlights and no origin stroke elsewhere — the same mismatch that keeps the lollipops themselves from showing the inconsistency color (see cautions).

```mermaid
flowchart TD
    subgraph Origins["Click origins"]
        TLI["TraceLinkItem row"]
        SEN["SentenceView sentence"]
        UML["UML component, interface, or edge"]
        ACM["ACMNode code element"]
        INC["InconsistencyItemDisplay row"]
    end

    HP["HighlightProvider state"]
    IP["InconsistencyProvider state"]
    TOAST["SearchResultMessage toast"]
    VIEWS["All five panel viewers"]

    TLI -->|"resetHighlightedInconsistencies"| IP
    TLI -->|"highlightSingleTraceLink"| HP
    INC -->|"resetHighlightedTraceLinks"| HP
    INC -->|"highlightSingleInconsistency"| IP
    SEN -->|"highlightElement DOCUMENTATION"| HP
    SEN -->|"highlightInconsistencyWithSentence"| IP
    UML -->|"highlightElement ARCHITECTURE_MODEL"| HP
    UML -->|"highlightInconsistencyWithModelId"| IP
    ACM -->|"highlightElement CODE_MODEL"| HP

    HP -->|"highlightedTraceLinks"| VIEWS
    IP -->|"highlighted inconsistency partitions"| VIEWS
    HP -->|"lastSearchTimestamp and messageSource"| TOAST
    IP -->|"lastSearchTimestamp and messageSource"| TOAST
    IP -->|"borrows setLastClickedSource"| HP
```

*Click propagation topology: list items are exclusive (each resets the other engine first), element clicks drive both contexts with the same id, and both contexts feed the toast plus every panel viewer.*

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant SV as SentenceView documentation panel
    participant HP as HighlightProvider
    participant IP as InconsistencyProvider
    participant P as Other viewer panels
    participant T as SearchResultMessage toast

    User->>SV: click sentence n
    SV->>HP: highlightElement n DOCUMENTATION
    HP->>HP: collect traceLinks with sentenceNumber equal n
    HP-->>P: highlightedTraceLinks and origin marker update
    HP-->>T: messageSource PROVIDED_PROJECT_ELEMENT and timestamp
    SV->>IP: highlightInconsistencyWithSentence n
    IP->>HP: setLastClickedSource n DOCUMENTATION
    IP-->>P: highlighted sentence inconsistencies update
    IP-->>T: messageSource PROVIDED_PROJECT_ELEMENT and timestamp
    P->>P: TraceLinkItem rows, UML nodes, ACM nodes and paths re-render
    T->>T: newest lastSearchTimestamp wins, tie combines both counts
    T-->>User: N trace links and M inconsistencies found, hides after 2 s
```

*One click, all panels: a sentence click updates both contexts synchronously, every panel re-derives its highlights from the shared state, and the toast reports the combined result.*

## How each panel consumes highlights

- **Tracelinks panel** — `TraceLinkItem` highlights rows contained in `highlightedTraceLinks` (`bg-highlight-tracelink`) and draws a 2 px colored border when it is the selection origin.
- **Documentation panel** — `SentenceView` checks both engines: a sentence is trace-link-highlighted when any highlighted link has its `sentenceNumber`, inconsistency-highlighted when a highlighted `TextEntityAbsentFromModel` entry matches. When both apply, the row renders a horizontal gradient from the trace-link color to the inconsistency color. A sentence that is the selection origin but matched nothing still gets a neutral `highlight-source` border.
- **Architecture panel** — `UMLComponentNode` highlights components whose `modelElementId` is referenced by a highlighted trace link or model inconsistency, painting a left-to-right gradient between the two highlight colors and a 3 px origin border. `UMLInterface` labels and the `UMLEdge` lollipops that carry an interface id (the merged pass-through virtual edge and `uml:InterfaceRealization` realizations; the `uml:Usage` lollipop is hover-only) share the same click handlers and highlight-color logic.
- **Code panel** — `ACMNode` enlarges and recolors its circle for highlighted nodes; plain clicks highlight, **Ctrl/Cmd+Click toggles collapse/expand instead of highlighting** (as its panel instructions state, with a dedicated `contextmenu` handler for the macOS Ctrl+Click-as-right-click case). `ACMViewer` additionally highlights the *ancestor edge paths* of every matched code element, computed against a separately retained fully expanded copy of the code tree (`copyExpandedTree`), and auto-expands the collapsed ancestors of matched nodes whenever `highlightedTraceLinks` changes — so a match inside a collapsed subtree becomes visible.
- **Inconsistencies panel** — `InconsistencyItemDisplay` highlights rows contained in `highlightedInconsistencies` and marks the selection origin with a colored border.

Consumer granularity differs by panel, and that is deliberate: list panels (`TracelinkViewer` via `TraceLinkItem`, `InconsistencyViewer` via `InconsistencyItemDisplay`) consume the raw highlight arrays and an `includes` check per row, while the per-element panels (`SentenceView`, `UMLComponentNode`, `UMLInterface`, `UMLEdge`) consume the derived sentence/model partitions so each element only re-checks its own kind of highlight. `ACMViewer` and `ACMNode` consume the raw `highlightedTraceLinks` array.

### TracelinkViewer sorting interacts with highlighting

`TraceLinkView` derives its displayed list as a render-time `useMemo` (`sortedTraceLinks`) over `[traceLinks, selectedSortMethod, highlightedTraceLinks, prioritizeHighlights]`. Two pieces interact with the highlight engine:

- The **"Highlights" toggle** (`prioritizeHighlights`): when enabled, the memo partitions the sorted list so every link in `highlightedTraceLinks` leads, followed by the non-highlighted ones. Because `highlightedTraceLinks` is a dependency of the memo, *every highlight change recomputes the list* while prioritization is on — highlights float to the top as they appear and disappear.
- The sort options themselves are filtered by trace-link type: the dimension the pipeline does not span is hidden (SAD_SAM hides "Code", SAD_CODE hides "Model", SAM_CODE hides "Sentence"), and a change of the underlying `traceLinks` array resets the sort selection to the "Sort By" sentinel (adjusting state during render, per the React "you might not need an effect" pattern).

## Wiring and lifecycle

Both result routes mount the identical provider tree around `ResultDisplay`:

- `/view/[id]` wraps `ResultDisplay` in `HighlightProvider(traceLinks, traceLinkType, loading)` with `InconsistencyProvider(inconsistencies, loading, error)` nested inside. `displayOptions` are the trace-link type's `resultViewOptions` with `TRACELINKS` unshifted first and `INCONSISTENCIES` appended (along with `ARCHITECTURE_MODEL`/`DOCUMENTATION` if missing) when the inconsistency query parameter requested them.
- `/view-provided/[id]` builds the same tree from locally stored data; its `displayOptions` are derived from the stored file types via `getResultViewOption`.

`ResultDisplay` renders up to three resizable panels (the first three `displayOptions`), a fullscreen tabbed dialog for all views, and the `SearchResultMessage` toast — all inside the provider tree, so a click in any panel instance (docked or fullscreen) updates the same shared highlight state. If results are absent — the "View Files Only" fallback with no parsed trace links, or no parsed inconsistencies — the empty-collection guards reduce every mutator to a no-op and the highlight engine stays inert.

## Invariants and cautions

- **Loose equality everywhere.** Matching and origin comparisons rely on `==`/`===` mixing: sentence ids are numbers, element ids are strings, and `lastClickedSource.id` is typed `string | number | null`. Changing id types on one side silently breaks matching on the other.
- **Origin-marker asymmetry.** Only `resetHighlightedTraceLinks` clears `lastClickedSource`; because the inconsistency engine only *borrows* the setter, `resetHighlightedInconsistencies` cannot clear the marker (nor the `messageSource` pair of the active selection's other half). Code that clears inconsistency highlights expecting the origin border to disappear will not get that effect.
- **Zero-match clicks are visible.** Both engines publish timestamps and message sources even when nothing matched, so the toast always reports "no … found" — do not "optimize" these state writes away.
- **UML interface/edge inconsistency integration is id-mismatched on both sides.** The highlight *checks* in `UMLInterface`/`UMLEdge` compare `inconsistency.id` (a `type-reason-…` composite) to the interface id — unlike `UMLComponentNode`, which compares `modelElementId` — so lollipops generally never show the inconsistency color. Symmetrically, lollipop *clicks* pass the interface id into `highlightInconsistencyWithModelId` (a model-element-id filter) and write the origin marker as an `ARCHITECTURE_MODEL` marker with the interface id, which component rectangles do not claim. Fix the comparison field and the argument domain if interface-level inconsistency highlighting is needed.
- **Non-memoized partitions.** `InconsistencyProvider` recomputes its four partitions on every render; large inconsistency lists multiply filter passes across every consumer re-render.
- **List-item clicks reset before they highlight.** Each row click clears the other engine first and then sets its own highlight, so after a trace-link or inconsistency click the two engines are never both active.
- **ACM collapse vs highlight.** Plain clicks on code nodes highlight; Ctrl/Cmd+Click (or Ctrl+left-button via `contextmenu` on macOS) toggles collapse/expand — the two gestures are intentionally separated so a highlighted subtree can also be explored.

## Related pages

- [Architecture](../architecture.md) — where the highlight contexts sit in the app and how both result routes feed them.
- [Result viewer](result-viewer.md) — panel layout, fullscreen dialog, and viewer module structure.
- [Domain model](../domain.md) — trace-link pipelines and the SAD-SAM restriction behind inconsistency highlighting.
- [Workflows](../workflows.md) — the user journey that ends in the multi-panel result exploration described here.
