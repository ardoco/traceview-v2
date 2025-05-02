import * as d3 from "d3";

import { SvgbasedHighlightingVisualization } from "./SvgbasedHighlightingVisualization";
import { Style } from "./style";
import {ACMPackage, CodeModel} from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/ACMDataModel";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  isPackage: boolean;
}

interface Edge extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
  label: string;
}

export class CodeModelTreeVisualization extends SvgbasedHighlightingVisualization {
  protected nodeIdRemapping: Map<string, string>;
  protected codeModel: CodeModel;

  /**
   * Instantiates a new CodeModelTreeVisualization object
   * @param viewport The viewport the visualization should be attached to
   * @param codeModel The code model to visualize
   * @param name A human readable name for the visualization
   * @param style A {@link Style} object that defines the visualization's appearance
   */
  constructor(
    viewport: HTMLElement,
    codeModel: CodeModel,
    name: string,
    style: Style,
  ) {
    super(viewport, 2000, 2000, name, style);
    this.codeModel = codeModel;
    const treeScale = 0.6;
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    this.nodeIdRemapping = new Map<string, string>();
    const contractSingleParentAndChild = true;
    for (let rootPackage of codeModel.getChildPackages()) {
      rootPackage.setIdToPath("");
      CodeModelTreeVisualization.traverseAndAddNodesAndEdges(
        rootPackage,
        null,
        nodes,
        edges,
        contractSingleParentAndChild,
      );
    }
    const stratify = d3
      .stratify<Node>()
      .id((d) => d.id)
      .parentId((d) => {
        const edge = edges.find((e) => e.target === d.id);
        return edge ? edge.source : null;
      });
    const root: d3.HierarchyNode<Node> = stratify(nodes);
    // viewport.scrollTop = this.svgHeight / 4;
    // viewport.scrollLeft = this.svgWidth / 4;
    viewport.scrollTop = this.svgHeight / 4;
    (viewport.firstChild as HTMLElement).style.backgroundColor =
      this.style.getPaperColor();
    const treeLayout = d3
      .tree()
      .size([treeScale * this.svgWidth, treeScale * this.svgHeight]);
    const tree = treeLayout(root as any);
    const offsetX = this.svgWidth / 8; // TODO: magic numbers, tree placement looks weird anyway
    const offsetY = this.svgHeight / 4;
    this.plot
      .append("g")
      .attr("transform", `translate(${offsetX}, ${offsetY})`)
      .selectAll(".link")
      .data(tree.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", style.getNotSelectableTextColor())
      .attr("d", (d) => {
        const pathGenerator = d3
          .linkHorizontal()
          .x((d) => (d as any).y)
          .y((d) => (d as any).x);
        return pathGenerator(d as any) || "";
      });
    this.plot
      .append("g")
      .attr("transform", `translate(${offsetX}, ${offsetY})`)
      .selectAll(".node")
      .data(tree.descendants())
      .enter()
      .append("circle")
      .attr("class", "node")
      .attr("r", (d: any) => this.getNodeStyle(d.data).nodeSize)
      .attr("nodeSize", (d: any) => this.getNodeStyle(d.data).nodeSize)
      .attr("fill", (d: any) => this.getNodeStyle(d.data).color)
      .attr("cx", (d) => d.y)
      .attr("cy", (d) => d.x)
      .on("click", (e, d: any) => {
        this.onClick(d.id);
      });
    this.plot
      .append("g")
      .attr("transform", `translate(${offsetX}, ${offsetY})`)
      .selectAll(".node-label")
      .data(tree.descendants())
      .enter()
      .append("text")
      .attr("class", "node-label")
      .attr("x", (d: any) => d.y + this.getNodeStyle(d.data).offsetX)
      .attr("y", (d: any) => d.x - this.getNodeStyle(d.data).offsetY)
      .text((d) => ((d.data as any).isPackage ? (d.data as any).label : ""))
      .attr("fill", (d) =>
        this.idIsHighlightable((d as any).id)
          ? this.style.getSelectableTextColor()
          : this.style.getNotSelectableTextColor(),
      )
      .attr("font-size", (d: any) => this.getNodeStyle(d.data).fontSize)
      .style("user-select", "none");

    // Add zoom and pan functionality
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 5]) // Constrain zoom level
      .on("zoom", (event) => {
        this.plot.attr("transform", event.transform);
      });

    d3.select(viewport as any)
      .call(zoom as any)
      .on("dblclick.zoom", null) // Disable double-click zoom
      .on("wheel.zoom", (event) => {
        if (event.ctrlKey || event.metaKey) {
          d3.select(viewport as any).call(zoom as any);
        }
      })
      .on("mousedown.zoom", (event) => {
        if (event.button === 1) {
          // Middle mouse button
          d3.select(viewport as any).call(zoom as any);
        }
      });

    // Add tooltips
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "1px solid black")
      .style("padding", "5px");

    this.plot
      .selectAll(".node")
      .on("mouseover", (event, d: any) => {
        tooltip.style("visibility", "visible").text(this.getName(d.id));
        // todo: highlight node
        d3.select(event.target)
            .attr("fill", "black"); // Lighter grey color for hover effect
      })
      .on("mousemove", (event) => {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", (event, d: any) => {
        tooltip.style("visibility", "hidden");
        d3.select(event.target)
            .attr("fill", "grey");
      });

    // Add legend as a separate HTML element within the "split-vis-half-container" element
    const legendData = [
      { color: style.getSelectableTextColor(), label: "Highlightable" },
      { color: style.getNotSelectableTextColor(), label: "Not Highlightable" },
    ];

    const legend = document.createElement("div");
    legend.className = "legend";
    legendData.forEach((item) => {
      const legendItem = document.createElement("div");
      legendItem.className = "legend-item";
      legendItem.innerHTML = `<div class="legend-color" style="background-color: ${item.color};"></div><span>${item.label}</span>`;
      legend.appendChild(legendItem);
    });
    const container = viewport.closest(
      ".split-vis-half-container",
    ) as HTMLElement;
    if (container) {
      container.style.position = "relative"; // Ensure the container is positioned relative
      legend.classList.add("legend"); // Add the legend class for styling
      container.appendChild(legend); // Append legend to container
    }
  }

  protected highlightElement(id: string, color: string): void {
    this.plot
      .selectAll(".node")
      .filter((d: any) => d.id === id)
      .attr("fill", color);
    this.plot
      .selectAll(".node-label")
      .filter((d: any) => d.id === id)
      .text((d: any) => this.getName(d.id))
      .style("text-shadow", "1px 1px 1px black")
      .attr("fill", color);
  }
  protected unhighlightElement(id: string): void {
    this.plot
      .selectAll(".node")
      .filter((d: any) => d.id === id)
      .attr("fill", this.style.getSelectableTextColor());
    this.plot
      .selectAll(".node-label")
      .filter((d: any) => d.id === id)
      .text((d: any) => (d.data.isPackage ? d.data.label : ""))
      .style("text-shadow", "none")
      .attr("fill", this.style.getSelectableTextColor());
  }

  protected setElementsHighlightable(ids: string[]): void {
    for (let id of ids) {
      if (!this.idIsHighlightable(id)) {
        this.plot
          .selectAll(".node")
          .filter((d: any) => d.id === id)
          .attr("fill", this.style.getSelectableTextColor());
        this.plot
          .selectAll(".node-label")
          .filter((d: any) => d.id === id)
          .attr("fill", this.style.getSelectableTextColor());
      }
    }
  }
  protected setElementsNotHighlightable(ids: string[]): void {
    for (let id of ids) {
      if (this.idIsHighlightable(id)) {
        this.plot
          .selectAll(".node")
          .filter((d: any) => d.id === id)
          .attr("fill", this.style.getNotSelectableTextColor())
          .size();
        this.plot
          .selectAll(".node-label")
          .filter((d: any) => d.id === id)
          .attr("fill", this.style.getNotSelectableTextColor());
      }
    }
  }

  private onClick(id: string): void {
    this.toggleHighlight(id);
  }

  private getNodeStyle(node: Node): {
    fontSize: number;
    color: string;
    nodeSize: number;
    offsetX: number;
    offsetY: number;
  } {
    const fontSize = node.isPackage ? 16 : 8;
    return {
      fontSize: fontSize,
      color: this.idIsHighlightable(node.id)
        ? this.style.getSelectableTextColor()
        : this.style.getNotSelectableTextColor(),
      nodeSize: node.isPackage ? 5 : 2,
      offsetX: node.isPackage ? fontSize / 2 : fontSize / 2,
      offsetY: node.isPackage ? fontSize / 4 : 0,
    };
  }

  public getName(id: string): string {
    const element = this.codeModel.getElement(id);
    return element != null ? element.name : "?" + id;
  }

  static traverseAndAddNodesAndEdges(
    pack: ACMPackage,
    parentId: string | null,
    nodes: Node[],
    edges: Edge[],
    contractSingleParentAndChild: boolean = true,
  ) {
    let localPack = pack;
    let localPrefix = pack.name;
    while (
      contractSingleParentAndChild &&
      localPack.getChildPackages().length === 1 &&
      localPack.getCompilationUnits().length === 0
    ) {
      localPack = localPack.getChildPackages()[0];
      localPrefix += "/" + localPack.name;
    }
    if (parentId != null) {
      edges.push({ source: parentId, target: localPack.id, label: "" });
    }
    nodes.push({ id: localPack.id, label: localPrefix, isPackage: true });
    for (let subPackage of localPack.getChildPackages()) {
      CodeModelTreeVisualization.traverseAndAddNodesAndEdges(
        subPackage,
        localPack.id,
        nodes,
        edges,
        contractSingleParentAndChild,
      );
    }
    for (let compilationUnit of localPack.getCompilationUnits()) {
      const truncatedCompilationUnitId = compilationUnit.id;
      nodes.push({
        id: truncatedCompilationUnitId,
        label: compilationUnit.name,
        isPackage: false,
      });
      edges.push({
        source: localPack.id,
        target: truncatedCompilationUnitId,
        label: "",
      });
    }
  }

  setStyle(style: Style) {
    this.style = style;
    this.plot.style("background-color", style.getPaperColor());
    this.plot
      .selectAll(".link")
      .attr("stroke", style.getNotSelectableTextColor());
    // get all highlighted colors nodes and labels set them to style.getSelectableTextColor()
    this.plot
      .selectAll(".node")
      .filter((d: any) => this.idIsHighlightable(d.id))
      .attr("fill", style.getSelectableTextColor());
    this.plot
      .selectAll(".node-label")
      .filter((d: any) => this.idIsHighlightable(d.id))
      .attr("fill", style.getSelectableTextColor());
    this.plot
      .selectAll(".node")
      .filter((d: any) => !this.idIsHighlightable(d.id))
      .attr("fill", style.getNotSelectableTextColor());
    this.plot
      .selectAll(".node-label")
      .filter((d: any) => !this.idIsHighlightable(d.id))
      .attr("fill", style.getNotSelectableTextColor());
  }
}
