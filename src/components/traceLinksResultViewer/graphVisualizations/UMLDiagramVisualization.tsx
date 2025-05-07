"use client";
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { UMLModel, UMLAbstractComponent } from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/UMLDataModel";
import {DragBehavior} from "d3";

interface Node extends d3.SimulationNodeDatum {
    id: string;
    name: string;
    type: "Component" | "Interface";
}

interface Edge extends d3.SimulationLinkDatum<Node>{
    source: string;
    target: string;
    type: "uses" | "extends";
}

interface Props {
    umlModel: UMLModel;
}

const UMLDiagram: React.FC<Props> = ({ umlModel }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [highlightedNode, setHighlightedNode] = useState<string | null>(null);

    useEffect(() => {
        if (!umlModel) return;

        const width = 800;
        const height = 600;

        const nodes: Node[] = umlModel.getElements()
            .filter((el) => {!el.isInterface()})
            .map((el) => ({
            id: el.getIdentifier(),
            name: el.getName(),
            type: el.isInterface() ? "Interface" : "Component",
        }));

        const edges: Edge[] = [];
        umlModel.getElements().forEach((el) => {
            el.getUses().forEach((used) => edges.push({ source: el.getIdentifier(), target: used.getIdentifier(), type: "uses" }));
            el.getExtends().forEach((extended) => edges.push({ source: el.getIdentifier(), target: extended.getIdentifier(), type: "extends" }));
        });

        const plot = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(edges).id((d: any) => d.id).distance(100))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide(50));

        const link = plot.selectAll(".link")
            .data(edges)
            .enter()
            .append("line")
            .attr("stroke", (d) => (d.type === "extends" ? "blue" : "gray"))
            .attr("stroke-width", 2);

        const nodeGroup = plot.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node");

        // @ts-ignore
        const dragBehavior: DragBehavior<SVGGElement, Node, d3.SimulationNodeDatum> = d3.drag()
            .on("start", (event, d:any) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                // @ts-ignore
                d.fx = d.x;
                d.fy = d.y;
            })
            .on("drag", (event, d:any) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", (event, d:any) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });

        nodeGroup.call(dragBehavior as any); // Fix TS issue

        const nodeRect = nodeGroup.append("rect")
            .attr("width", (d) => d.name.length * 8 + 20)
            .attr("height", 30)
            .attr("rx", 5)
            .attr("ry", 5)
            .attr("fill", (d) => (d.type === "Interface" ? "lightblue" : "lightgray"))
            .attr("stroke", (d) => (highlightedNode === d.id ? "red" : "black"))
            .on("mouseover", function () {
                d3.select(this).attr("fill", "lightyellow");
            })
            .on("mouseout", function (event, d) {
                d3.select(this).attr("fill", d.type === "Interface" ? "lightblue" : "lightgray");
            })
            .on("click", (event, d) => {
                setHighlightedNode(d.id);
                d3.selectAll("rect").attr("stroke", "black");
                d3.select(event.currentTarget).attr("stroke", "red");
            });

        nodeGroup.append("text")
            .attr("dx", 10)
            .attr("dy", 20)
            .text((d) => d.name)
            .attr("font-size", "12px")
            .attr("fill", "black");

        simulation.on("tick", () => {
            link
                .attr("x1", (d) => (d.source as unknown as Node).x!)
                .attr("y1", (d) => (d.source as unknown as Node).y!)
                .attr("x2", (d) => (d.target as unknown as Node).x!)
                .attr("y2", (d) => (d.target as unknown as Node).y!);

            nodeGroup
                .attr("transform", (d) => `translate(${d.x}, ${d.y})`);
        });

        return () => {
            simulation.stop();
        };
    }, [umlModel, highlightedNode]);

    return <svg ref={svgRef}></svg>;
};

export default UMLDiagram;
