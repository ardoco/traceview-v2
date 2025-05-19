'use client'

import * as d3 from "d3";
import React, {useCallback, useEffect, useRef} from "react";
import { CodeModelUnit } from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/ACMDataModel";
import {useHighlightContext} from "@/components/traceLinksResultViewer/util/HighlightContextType";
import {HierarchyNode} from "d3";

interface CodeModelVisualizationProps {
    codeModel: CodeModelUnit;
}

export function CodeModelVisualization({ codeModel }: CodeModelVisualizationProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const highlightedNodeIdRef = useRef<string | null>(null); // useRef instead of useState to avoid re-renders
    const rootRef = useRef<HierarchyNode<CodeModelUnit> | null>(null);


    const { highlightedTraceLinks, highlightElement } = useHighlightContext();

    // Tree layout spacing constants
    const dx = 10; // vertical space between nodes
    const dy = 200; // horizontal space between levels
    const margin = { top: 10, right: 10, bottom: 10, left: 40 };
    const width = 2000;
    const height = 2000;

    function expandPathToNode(node: HierarchyNode<CodeModelUnit>) {
        let current = node;
        while (current.parent) {
            current.parent.children = current.parent._children;
            current = current.parent;
        }
    }






    useEffect(() => {
        if (!codeModel || !svgRef.current) return;

        // Step 1: Convert the data into a d3 hierarchy
        const root:HierarchyNode<CodeModelUnit> = d3.hierarchy(codeModel, d => d.children);

        // Set initial positions for animation
        root.x0 = dy / 2;
        root.y0 = 0;

        rootRef.current = root;

        // Step 2: Prepare layout generators
        const tree = d3.tree<CodeModelUnit>().nodeSize([dx, dy]);
        const diagonal = d3.linkHorizontal()
            .x(d => (d as any).y)
            .y(d => (d as any).x);

        // Step 3: Select and configure the SVG
        const svg = d3.select(svgRef.current);

        // Only remove the container <g>, not the entire SVG
        svg.select("g").remove();

        svg
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-margin.left, -margin.top, width, height])
            .style("font", "10px sans-serif")
            .style("user-select", "none");

        // Create container group for zoom and pan
        const container = svg.append("g");

        // Group for links (edges)
        const gLink = container.append("g")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", 1.5);

        // Group for nodes (circles + labels)
        const gNode = container.append("g")
            .attr("cursor", "pointer")
            .attr("pointer-events", "all");

        // Step 4: Enable zoom and pan
        svg.call(
            d3.zoom()
                .scaleExtent([0.25, 8])
                .on("zoom", (event) => {
                    container.attr("transform", event.transform);
                })
        );

        // Step 5: Define update/render logic
        function update(event: any, source: any) {
            const duration = event?.altKey ? 2500 : 250;

            // Compute the new tree layout
            tree(root);
            const nodes = root.descendants().reverse();
            const links = root.links();

            console.log("tree", tree)
            console.log("nodes", nodes)
            console.log("links", links)

            // Compute height based on node positions
            let left = root;
            let right = root;
            root.eachBefore(node => {
                if (node.x < left.x) left = node;
                if (node.x > right.x) right = node;
            });
            const height = right.x - left.x + margin.top + margin.bottom;

            // Resize SVG viewBox accordingly
            svg.transition()
                .duration(duration)
                .attr("viewBox", [-margin.left, left.x - margin.top, width, height]);

            // ----- NODES -----
            const node = gNode.selectAll("g")
                .data(nodes, (d: any) =>`node-${d.data.path}` || (d.id = Math.floor(Math.random() * 4000).toString()));

            // ENTER
            const nodeEnter = node.enter().append("g")
                .attr("id", d => `node-${d.data.path}`)
                .attr("transform", () => `translate(${source.y0},${source.x0})`)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 0)
                .on("click", (event, d: any) => {
                    if (event.ctrlKey) {
                        // collapse/expand the node
                        d.children = d.children ? null : d._children;
                        update(event, d);
                        update(event, d);
                    } else {
                        // highlight the node
                        const previouslyHighlighted = highlightedNodeIdRef.current;

                        // Reset styles for all nodes and links
                        // Reset all nodes
                        d3.selectAll("g.node").each(function (d: any) {
                            d3.select(this).select("circle")
                                .attr("fill", d._children ? "#555" : "#999")
                                .attr("r", 4);

                            d3.select(this).select("text")
                                .style("fill", "black")
                                .style("font-weight", "normal");
                        });

                        // Reset all links
                        d3.selectAll("path.link").each(function (d: any) {
                            d3.select(this)
                                .attr("stroke", "#555")
                                .attr("stroke-width", 1.5)
                                .attr("stroke-opacity", 0.4);
                        });


                        if (previouslyHighlighted === d.id) {
                            highlightedNodeIdRef.current = null;
                            return;
                        }

                        // Save newly highlighted node
                        highlightedNodeIdRef.current = d.id;
                        highlightElement(d.data.path , "codeElementId");
                        console.log(highlightedTraceLinks, d.data.path,d )

                        // Expand the path to the node
                        expandPathToNode(d);

                        // get path to from the current to the root
                        const pathToRoot = [];
                        let current = d;
                        while (current) {
                            pathToRoot.push(current);
                            current = current.parent;
                        }

                        d3.select(`#node-${d.id} circle`).attr("r",6)

                        pathToRoot.forEach(node => {
                            // Highlight circle
                            d3.select(`#node-${node.id} circle`)
                                .attr("fill", "#4664aa") // blau-500

                            // Highlight text
                            d3.select(`#node-${node.id} text`)
                                .style("fill", "#4664aa")
                                .style("font-weight", "bold");

                            // Highlight link to parent
                            if (node.parent) {
                                d3.select(`#link-${node.parent.id}-${node.id}`)
                                    .attr("stroke", "#4664aa")
                                    .attr("stroke-width", 3)
                                    .attr("stroke-opacity", 1);
                            }
                        }   );
                        update(event, d);
                    }
                })
                .on("mouseover", (event, d) => {
                    d3.select(event.currentTarget)
                        .attr("cursor", "pointer")
                        .attr("fill", "#4664aa");
                })
                .on("mouseout", (event, d) => {
                    d3.select(event.currentTarget)
                        .attr("cursor", "pointer")
                        .attr("fill", "#000000");
                });


            nodeEnter.append("circle")
                .attr("r", 4)
                .attr("fill", d => d._children ? "#555" : "#999")
                .attr("stroke-width", 10);

            nodeEnter.append("text")
                .attr("dy", "0.31em")
                .attr("x", d => d._children ? -6 : 6)
                .attr("text-anchor", d => d._children ? "end" : "start")
                .text(d => d.data.name)
                .attr("stroke-linejoin", "round")
                .attr("stroke-width", 3)
                .attr("stroke", "white")
                .attr("paint-order", "stroke");

            // UPDATE
            node.merge(nodeEnter)
                .transition()
                .duration(duration)
                .attr("transform", d => `translate(${d.y},${d.x})`)
                .attr("fill-opacity", 1)
                .attr("stroke-opacity", 1);

            // EXIT
            node.exit()
                .transition()
                .duration(duration)
                .attr("transform", () => `translate(${source.y},${source.x})`)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 0)
                .remove();

            // ----- LINKS -----
            const link = gLink.selectAll("path")
                .data(links, (d: any) => d.target.id);

            // ENTER
            const linkEnter = link.enter().append("path")
                .attr("id", d => `link-${d.source.id}-${d.target.id}`)
                .attr("d", () => {
                    const o = { x: source.x0, y: source.y0 };
                    return diagonal({ source: o, target: o } as any);
                });

            // UPDATE
            link.merge(linkEnter)
                .transition()
                .duration(duration)
                .attr("d", diagonal as any);

            // EXIT
            link.exit()
                .transition()
                .duration(duration)
                .attr("d", () => {
                    const o = { x: source.x, y: source.y };
                    return diagonal({ source: o, target: o } as any);
                })
                .remove();

            // Save current positions for future transitions
            root.eachBefore(d => {
                d.x0 = d.x;
                d.y0 = d.y;
            });

            // // Un-highlight if currently highlighted node becomes hidden
            // if (highlightedNodeIdRef.current !== null) {
            //     highlightNodeById(highlightedNodeIdRef.current, root);
            // }

        }

        root.descendants().forEach((d, i) => {
            d.id = d.data.id ?? i;
            d._children = d.children;
            if (d.depth > 1) d.children = null;
        });

        update(null, root);

        // TODO: Zoom to the currently visible nodes

    }, [codeModel]);

    // useEffect(() => {
    //     if (!svgRef.current || !highlightedTraceLinks.length) return;
    //
    //     // Assuming you only highlight the first matched trace link for now
    //     const firstTraceLink = highlightedTraceLinks[0];
    //     const targetCodeElementId = firstTraceLink.codeElementId;
    //     const nodeId = `node-${targetCodeElementId}`; // Match format used in D3 ids
    //
    //     // Remove the 'node-' prefix in D3 before comparing if needed
    //     console.log(nodeId, d3.selectAll("g"))
    //     const d3Node = d3.select(nodeId);
    //     if (!d3Node.empty()) {
    //         const allNodes = d3.selectAll("circle").attr("r", 4).attr("fill", "#999");
    //         highlightNodeById(targetCodeElementId, rootRef?.current);
    //     }
    // }, [highlightedTraceLinks]);


    return (
        <div className="relative w-full h-full">
            <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />
        </div>
        )

}
