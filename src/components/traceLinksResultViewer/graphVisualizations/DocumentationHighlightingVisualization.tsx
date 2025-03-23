
import { HighlightingVisualization } from "./HighlightingVisualization";
import { ConceptualUIButton } from "./abstractUI";
import { Style } from "./style";
import {NLSentence} from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/DocumentationSentence";

export class NLHighlightingVisualization extends HighlightingVisualization {
  protected visualizedArtifacts: Map<string, NLSentence>;
  protected viewportDiv: HTMLElement;
  protected artifactVisualizations: Map<string, HTMLElement>;
  protected showUnselectable: boolean;

  protected hideableRows: Map<string, HTMLElement> = new Map<
    string,
    HTMLElement
  >();

  /**
   * Instantiates a new NLHighlightingVisualization object
   * @param viewport The viewport the visualization should be attached to
   * @param sentences A list of sentences to be visualized
   * @param name A human readable name for the visualization
   * @param style A {@link Style} object that defines the visualization's appearance
   */
  constructor(
    viewport: HTMLElement,
    sentences: NLSentence[],
    name: string,
    style: Style,
  ) {
    super(name, style);
    viewport.style.overflow = "auto";
    this.showUnselectable = true;
    this.visualizedArtifacts = new Map<string, NLSentence>();
    this.artifactVisualizations = new Map<string, HTMLElement>();
    this.hideableRows = new Map<string, HTMLElement>();
    for (let artifact of sentences) {
      this.visualizedArtifacts.set(artifact.getIdentifier(), artifact);
    }
    this.viewportDiv = viewport;
    this.viewportDiv.style.backgroundColor = this.style.getPaperColor();
    let i: number = 0;
    for (let artifact of this.visualizedArtifacts.values()) {
      let artifactDiv = document.createElement("div");
      const rowDiv = document.createElement("div");
      const rowNumberDiv = document.createElement("div");
      rowNumberDiv.appendChild(document.createTextNode(i + 1 + ""));
      rowNumberDiv.classList.add("sentence-item-row-number");
      rowDiv.classList.add("sentence-item-row");
      artifactDiv.setAttribute("id", artifact.getIdentifier());
      artifactDiv.classList.add("sentence-item");
      if (this.idIsHighlightable(artifact.getIdentifier())) {
        artifactDiv.style.cursor = "pointer";
        artifactDiv.addEventListener(
          "mouseover",
          () =>
            (artifactDiv.style.backgroundColor = this.style.getHoverColor()),
        );
        artifactDiv.addEventListener(
          "mouseout",
          () =>
            (artifactDiv.style.backgroundColor = this.style.getPaperColor()),
        );
      } else {
        artifactDiv.style.color = this.style.getNotSelectableTextColor();
      }
      artifactDiv.appendChild(document.createTextNode(artifact.getContent()));
      rowDiv.appendChild(rowNumberDiv);
      rowDiv.appendChild(artifactDiv);
      this.viewportDiv.appendChild(rowDiv);
      this.artifactVisualizations.set(artifact.getIdentifier(), artifactDiv);
      this.hideableRows.set(artifact.getIdentifier(), rowDiv);
      artifactDiv.addEventListener("click", () => {
        this.toggleHighlight(artifact.getIdentifier());
      });
      if (i == 0) {
        rowDiv.style.borderTop = "0px";
      }
      i++;
    }
  }

  getButtons(): ConceptualUIButton[] {
    const buttons: ConceptualUIButton[] = [
      new ConceptualUIButton(
        "👁",
        "Show/Hide Unhighlightable Sentences",
        () => {
          this.showUnselectable = !this.showUnselectable;
          for (let id of this.hideableRows.keys()) {
            this.hideableRows.get(id)!.style.display = this.showUnselectable
              ? "flex"
              : "none";
          }
          return this.showUnselectable;
        },
        true,
        this.showUnselectable,
      ),
    ];
    return buttons.concat(super.getButtons());
  }

  protected highlightElement(id: string, color: string): void {
    const item = this.artifactVisualizations.get(id)!;
    item.style.color = color;
    item.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }
  protected unhighlightElement(id: string): void {
    this.artifactVisualizations.get(id)!.style.color =
      this.style.getSelectableTextColor();
  }

  protected setElementsHighlightable(ids: string[]): void {
    for (let id of ids) {
      if (this.artifactVisualizations.has(id)) {
        this.artifactVisualizations.get(id)!.style.color =
          this.style.getSelectableTextColor();
      }
      if (this.hideableRows.has(id)) {
        this.hideableRows.get(id)!.style.display = "flex";
        this.hideableRows.delete(id);
      }
    }
  }

  protected setElementsNotHighlightable(ids: string[]): void {
    for (let id of ids) {
      if (this.artifactVisualizations.has(id)) {
        this.artifactVisualizations.get(id)!.style.color =
          this.style.getNotSelectableTextColor();
      }
    }
  }

  public getName(id: string): string {
    if (id[id.length - 1] == "1") {
      return id + "st Sentence";
    } else if (id[id.length - 1] == "2") {
      return id + "nd Sentence";
    } else if (id[id.length - 1] == "3") {
      return id + "rd Sentence";
    }
    return id + "th Sentence";
  }

  setStyle(style: Style): void {
    this.style = style;
    this.viewportDiv.style.backgroundColor = this.style.getPaperColor();
    for (let id of this.visualizedArtifacts.keys()) {
      const item = this.artifactVisualizations.get(id)!;
      if (this.idIsHighlightable(id)) {
        item.style.color = this.style.getSelectableTextColor();
      } else {
        item.style.color = this.style.getNotSelectableTextColor();
      }
    }
  }
}
