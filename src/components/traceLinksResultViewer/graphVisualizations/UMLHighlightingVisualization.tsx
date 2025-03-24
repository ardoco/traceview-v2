import * as d3 from "d3";

import { ConceptualUIButton } from "./abstractUI";
import { SvgbasedHighlightingVisualization } from "./SvgbasedHighlightingVisualization";
import { Style } from "./style";
import {UMLModel} from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/UMLDataModel";

const EDGE_LABEL_SCALE = 0.7;
const FONT_SIZE = 15;

interface Node extends d3.SimulationNodeDatum {
  id: string;
  width: number;
  height: number;
  name: string;
}

interface Edge extends d3.SimulationLinkDatum<Node> {
  source: string;
  target: string;
  label: string;
  id: string;
}

export function getTextWidth(text: string, fontSize: number): number {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  context.font = fontSize + "px 'Roboto Mono', monospace";
  const width = context.measureText(text).width;
  return width;
}

/**
 * A visualization of an UML component model as a node-link diagram.
 */
export class UMLHighlightingVisualization extends SvgbasedHighlightingVisualization {
  protected simulation: d3.Simulation<Node, Edge>;
  protected showEdgeLabels: boolean;
  protected userCanNotDragNodes: boolean;
  protected edgeLabels: d3.Selection<
    SVGTextElement,
    Edge,
    SVGSVGElement,
    unknown
  >;
  protected firstEdgesSelection: d3.Selection<
    SVGLineElement,
    Edge,
    SVGSVGElement,
    unknown
  >;
  protected secondEdgesSelection: d3.Selection<
    SVGLineElement,
    Edge,
    SVGSVGElement,
    unknown
  >;
  protected nodes: Node[];
  protected marker: d3.Selection<SVGPathElement, unknown, null, undefined>;

  constructor(
    viewport: HTMLElement,
    model: UMLModel,
    name: string,
    style: Style,
  ) {
    console.log("Creating UMLHighlightingVisualization");
    super(viewport, 2000, 2000, name, style);
    this.showEdgeLabels = true;
    this.userCanNotDragNodes = true;
    this.nodes = [];
    for (let element of model.getElements()) {
      if (!element.isInterface()) {
        this.nodes.push({
          id: element.getIdentifier(),
          width: getTextWidth(element.getName(), FONT_SIZE) + 25,
          height: 32,
          name: element.getName(),
        });
      }
    }
    const edgeSet = new Set<Edge>();
    for (let userElement of model.getElements()) {
      for (let usedElement of userElement.getUses()) {
        for (let child of usedElement.getChildComponents()) {
          edgeSet.add({
            source: userElement.getIdentifier(),
            target: child.getIdentifier(),
            label: usedElement.getName(),
            id: usedElement.getIdentifier(),
          });
        }
      }
    }
    const links = Array.from(edgeSet.values());
    console.log(links.length);
    viewport.scrollLeft = this.svgWidth / 4;
    viewport.scrollTop = this.svgHeight / 4;
    (viewport.firstChild as HTMLElement).style.backgroundColor =
      this.style.getPaperColor();
    this.marker = this.secretlyMakeMarkers();
    this.simulation = d3
      .forceSimulation(this.nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => (d as any).id)
          .distance(100),
      )
      .force(
        "charge",
        d3.forceManyBody().strength((d) => 1000),
      )
      .force(
        "collision",
        d3.forceCollide().radius((d) => Math.min((d as any).width, 150)),
      )
      .force("center", d3.forceCenter(this.svgWidth / 2, this.svgHeight / 2));
    const simulation = this.simulation;
    const dragstarted = (event: any, d: any) => {
      if (this.userCanNotDragNodes) return;
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    };
    const dragged = (event: any, d: any) => {
      if (this.userCanNotDragNodes) return;
      d.fx = event.x;
      d.fy = event.y;
    };
    const dragended = (event: any, d: any) => {
      if (this.userCanNotDragNodes) return;
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    };
    const rectDrag = d3
      .drag<SVGRectElement, Node>()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
    const labelDrag = d3
      .drag<SVGTextElement, Node>()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
    const linkGroups = this.plot
      .selectAll<SVGGElement, Edge>("g")
      .data(links)
      .enter()
      .append("g")
      .attr("stroke-width", 2)
      .attr("stroke", this.style.getSelectableTextColor());
    this.secondEdgesSelection = linkGroups.append("line");
    this.firstEdgesSelection = linkGroups
      .append("line")
      .attr("marker-end", "url(#semicircle)");
    const node = this.plot
      .selectAll<SVGRectElement, Node>("rect")
      .data(this.nodes)
      .enter()
      .append("rect")
      .attr("width", (d) => d.width)
      .attr("height", (d) => d.height)
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("fill", this.style.getPaperColor())
      .attr("stroke", (d: Node) =>
        this.idIsHighlightable(d.id)
          ? this.style.getSelectableTextColor()
          : this.style.getNotSelectableTextColor(),
      )
      .attr("cursor", (d: Node) =>
        this.idIsHighlightable(d.id) ? "pointer" : "default",
      )
      .on("click", (i, d: Node) => this.handleClickOn(d.id))
      .call(rectDrag);
    const labelSelection = this.plot
      .selectAll<SVGTextElement, Node>("text")
      .data(this.nodes)
      .enter()
      .append("text")
      .attr("dy", 5)
      .attr("text-anchor", "middle")
      .attr("font-size", FONT_SIZE)
      .attr("stroke", (d: Node) =>
        this.idIsHighlightable(d.id)
          ? this.style.getSelectableTextColor()
          : this.style.getNotSelectableTextColor(),
      )
      .attr("fill", (d: Node) =>
        this.idIsHighlightable(d.id)
          ? this.style.getSelectableTextColor()
          : this.style.getNotSelectableTextColor(),
      )
      .attr("cursor", (d: Node) =>
        this.idIsHighlightable(d.id) ? "pointer" : "default",
      )
      .text((d) => d.name)
      .style("user-select", "none")
      .on("click  ", (i, d: Node) => this.handleClickOn(d.id))
      .call(labelDrag);
    this.edgeLabels = linkGroups
      .append("text")
      .text((d) => d.label)
      .attr("stroke", (d: Edge) =>
        this.idIsHighlightable(d.id)
          ? this.style.getSelectableTextColor()
          : this.style.getNotSelectableTextColor(),
      )
      .attr("fill", (d: Edge) =>
        this.idIsHighlightable(d.id)
          ? this.style.getSelectableTextColor()
          : this.style.getNotSelectableTextColor(),
      )
      .attr("font-size", EDGE_LABEL_SCALE * FONT_SIZE)
      .attr("text-anchor", "middle")
      .attr("stroke-dasharray", null)
      .attr("stroke-width", 0.5)
      .attr("dy", -1.2 * FONT_SIZE)
      .style("user-select", "none")
      .attr("transform", this.getEdgeLabelTransform())
      .on("click", (i, d: Edge) => this.handleClickOn(d.id));
    this.redrawEdges();
    simulation.on("tick", () => {
      this.redrawEdges();
      node
        .attr("x", (d) => (d as any).x - d.width / 2)
        .attr("y", (d) => (d as any).y - d.height / 2);
      labelSelection
        .attr("x", (d) => (d as any).x)
        .attr("y", (d) => (d as any).y);
    });
    for (let i = 0; i < 1000; i++) simulation.tick();
  }

  private redrawEdges(): void {
    this.firstEdgesSelection
      .attr("x1", (d) => this.edgeSourcePosition(d).x)
      .attr("y1", (d) => this.edgeSourcePosition(d).y)
      .attr("x2", (d) => this.edgeCenterPosition(d).x)
      .attr("y2", (d) => this.edgeCenterPosition(d).y);
    this.secondEdgesSelection
      .attr("x1", (d) => this.edgeCenterPosition(d).x)
      .attr("y1", (d) => this.edgeCenterPosition(d).y)
      .attr("x2", (d) => this.edgeTargetPosition(d).x)
      .attr("y2", (d) => this.edgeTargetPosition(d).y);
    this.edgeLabels
      .attr("x", (d) => this.edgeCenterPosition(d).x)
      .attr("y", (d) => this.edgeCenterPosition(d).y)
      .attr("transform", this.getEdgeLabelTransform())
      .style("display", this.showEdgeLabels ? "block" : "none");
  }

  getButtons(): ConceptualUIButton[] {
    const buttons = [
      new ConceptualUIButton(
        "❄",
        "Freeze/Unfreeze Simulation",
        () => {
          this.userCanNotDragNodes = !this.userCanNotDragNodes;
          return this.userCanNotDragNodes;
        },
        true,
        this.userCanNotDragNodes,
      ),
      new ConceptualUIButton(
        "⎁",
        "Toggle Edge Labels",
        () => {
          this.showEdgeLabels = !this.showEdgeLabels;
          this.redrawEdges();
          return this.showEdgeLabels;
        },
        true,
        this.showEdgeLabels,
      ),
    ];
    return buttons.concat(super.getButtons());
  }

  private edgeSourcePosition(d: Edge): { x: number; y: number } {
    return { x: (d.source as any).x, y: (d.source as any).y };
  }

  private edgeTargetPosition(d: Edge): { x: number; y: number } {
    return { x: (d.target as any).x, y: (d.target as any).y };
  }

  private edgeCenterPosition(d: Edge): { x: number; y: number } {
    const source = this.edgeSourcePosition(d);
    const target = this.edgeTargetPosition(d);
    return { x: (source.x + target.x) / 2, y: (source.y + target.y) / 2 };
  }

  handleClickOn(id: string): void {
    this.toggleHighlight(id);
  }

  protected highlightElement(id: string, color: string): void {
    this.setNodeColor(id, color);
    this.setEdgeLabelColor(id, color);
  }

  protected unhighlightElement(id: string): void {
    this.setNodeColor(id, this.style.getSelectableTextColor());
    this.setEdgeLabelColor(id, this.style.getSelectableTextColor());
  }

  protected setElementsHighlightable(ids: string[]): void {
    for (let id of ids) {
      this.setNodeColor(id, this.style.getSelectableTextColor());
    }
  }
  protected setElementsNotHighlightable(ids: string[]): void {
    for (let id of ids) {
      this.setNodeColor(id, this.style.getNotSelectableTextColor());
    }
  }

  public getName(id: string): string {
    console.log("Getting name for " + id);
    const nodeElement = this.nodes.find((n) => n.id == id);
    const edgeElement = this.plot
      .selectAll<SVGTextElement, Edge>("text")
      .filter((d) => d.id == id);
    if (nodeElement != undefined) {
      return nodeElement.name;
    } else if (edgeElement != undefined) {
      return edgeElement.text();
    }
    return "?";
  }

  private setEdgeLabelColor(id: string, color: string): void {
    this.plot
      .selectAll<SVGTextElement, Edge>("text")
      .filter((d) => d.id == id)
      .attr("stroke", color);
  }

  private setNodeColor(id: string, color: string): void {
    this.plot
      .selectAll<SVGRectElement, Node>("rect")
      .filter((d) => d.id == id)
      .attr("stroke", color);
    this.plot
      .selectAll<SVGLineElement, Node>("text")
      .filter((d) => d.id == id)
      .attr("stroke", color)
      .attr("fill", color);
  }

  private getEdgeLabelTransform(): (d: Edge) => string {
    return (d) => {
      const x1 = this.edgeSourcePosition(d).x;
      const y1 = this.edgeSourcePosition(d).y;
      const x2 = this.edgeTargetPosition(d).x;
      const y2 = this.edgeTargetPosition(d).y;
      const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
      let adjustedAngle = angle;
      if (angle > 90) {
        adjustedAngle -= 180;
      } else if (angle < -90) {
        //adjustedAngle += 180;
      }
      return (
        "rotate(" +
        adjustedAngle +
        "," +
        (x1 + x2) / 2 +
        "," +
        (y1 + y2) / 2 +
        ")"
      );
    };
  }

  private secretlyMakeMarkers(): d3.Selection<
    SVGPathElement,
    unknown,
    null,
    undefined
  > {
    const semiCirclePath = d3.path();
    semiCirclePath.arc(
      25,
      25,
      7,
      0.5 * Math.PI,
      0.5 * Math.PI + Math.PI,
      false,
    );
    semiCirclePath.moveTo(30, 25);
    semiCirclePath.arc(25, 25, 4, 0, 2 * Math.PI);
    const marker = this.plot
      .append("defs")
      .append("marker")
      .attr("id", "semicircle")
      .attr("refX", 25)
      .attr("refY", 25)
      .attr("markerWidth", 50)
      .attr("markerHeight", 50)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", this.style.getPaperColor())
      .attr("stroke", this.style.getSelectableTextColor())
      .attr("d", semiCirclePath.toString());
    this.plot
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("refX", 5)
      .attr("refY", 5)
      .attr("markerWidth", 10)
      .attr("markerHeight", 10)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "none")
      .attr("stroke", this.style.getSelectableTextColor())
      .attr("d", "M0,0 L10,5 L0,10");
    return marker;
  }

  setStyle(style: Style): void {
    this.style = style;
    this.plot.style("background-color", style.getPaperColor());
    this.plot
      .selectAll<SVGRectElement, Node>("rect")
      .filter((d) => this.idIsHighlightable(d.id))
      .attr("stroke", style.getSelectableTextColor())
      .attr("fill", style.getPaperColor());
    this.plot
      .selectAll<SVGTextElement, Node>("text")
      .filter((d) => this.idIsHighlightable(d.id))
      .attr("stroke", style.getSelectableTextColor())
      .attr("fill", style.getSelectableTextColor());
    this.plot
      .selectAll<SVGLineElement, Edge>("line")
      .filter((d) => this.idIsHighlightable(d.id))
      .attr("stroke", style.getSelectableTextColor());
    this.marker
      .attr("stroke", style.getSelectableTextColor())
      .attr("fill", this.style.getPaperColor());
  }
}
