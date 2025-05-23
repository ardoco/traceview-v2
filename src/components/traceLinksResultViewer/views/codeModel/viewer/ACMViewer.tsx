import React, {useEffect, useMemo, useRef, useState} from "react";
import {hierarchy, linkHorizontal, select, tree} from "d3";
import {CodeModelUnit} from "@/components/traceLinksResultViewer/views/codeModel/dataModel/ACMDataModel";
import ACMNode from "@/components/traceLinksResultViewer/views/codeModel/viewer/ACMNode";
import * as d3 from "d3";
import ACMLink from "@/components/traceLinksResultViewer/views/codeModel/viewer/ACMLink";
import {useHighlightContext} from "@/components/traceLinksResultViewer/views/HighlightContextType";

type ACMViewerProps = {
    codeModel: CodeModelUnit;
}

const dx = 10; // vertical space between nodes
const dy = 200; // horizontal space between levels

export default function ACMViewer({codeModel}: ACMViewerProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<SVGGElement | null>(null);

    const [treeRoot, setTreeRoot] = useState(() => {
        const root = hierarchy(codeModel, d => d.children);

        root.eachBefore(d => {
            d.id = d.data.id;
            d._children = d.children;
            if (d.depth > 3) {
                d.children = null; // collapse deeper nodes
            }
        });

        return root;
    });

    const nodeTree = useMemo(() => {
        return tree<CodeModelUnit>().nodeSize([dx, dy])(treeRoot);
    }, [treeRoot]);

    const nodes = useMemo(() => nodeTree.descendants().reverse(), [nodeTree]);
    const links = useMemo(() => nodeTree.links(), [nodeTree]);

    const diagonal = linkHorizontal().x(d => (d as any).y).y(d => (d as any).x);
    const {highlightedTraceLinks} = useHighlightContext();


    // starting from the highlightedTraceLinks, find the links on the path to the root
    const highlightedPaths = new Set<string>();
    if (highlightedTraceLinks.length > 0) {
        for (const traceLink of highlightedTraceLinks) {
            const matchingNode = nodes.find(n =>
                traceLink.codeElementId === n.data.path ||
                traceLink.codeElementId.startsWith(n.data.path + ".")
            );

            let current = matchingNode;
            while (current && current.parent) {
                const key = `${current.parent.data.id}->${current.data.id}`;
                highlightedPaths.add(key);
                current = current.parent;
            }
        }
    }

    function getAllNodes<T>(root: d3.HierarchyNode<T>): d3.HierarchyNode<T>[] {
        const allNodes: d3.HierarchyNode<T>[] = [];

        function traverse(node: d3.HierarchyNode<T>) {
            allNodes.push(node);
            const children = node.children ?? node._children;
            if (children) {
                for (const child of children) {
                    traverse(child);
                }
            }
        }

        traverse(root);
        return allNodes;
    }

    function computeNodesBBox(nodes: d3.HierarchyNode<CodeModelUnit>[]) {
        if (nodes.length === 0) return null;
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (const node of nodes) {
            if (node.x < minX) minX = node.x;
            if (node.x > maxX) maxX = node.x;
            if (node.y < minY) minY = node.y;
            if (node.y > maxY) maxY = node.y;
        }

        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }

    const allNodes = getAllNodes(treeRoot);

    useEffect(() => {
        const svg = select(svgRef.current);
        const container = select(containerRef.current);
        svg.call(
            d3.zoom()
                .scaleExtent([0.25, 8])
                .on("zoom", (event) => {
                    container.attr("transform", event.transform);
                })
        );
    })

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;
        if (nodes.length === 0 || links.length === 0) return; // wait for nodes & links

        const svg = select(svgRef.current);
        const container = select(containerRef.current);

        const bbox = computeNodesBBox(allNodes);
        if (!bbox) return;

        const svgWidth = svgRef.current.clientWidth;
        const svgHeight = svgRef.current.clientHeight;

        const padding = 20;
        const scale = Math.min(
            (svgWidth - padding * 2) / bbox.width,
            (svgHeight - padding * 2) / bbox.height,
            1
        );

        const translateX = (svgWidth - scale * (bbox.x + bbox.width / 2));
        const initialTransform = d3.zoomIdentity.translate(-dy * 2 , translateX)

        const zoomBehavior = d3.zoom()
            .scaleExtent([0.25, 8])
            .on("zoom", (event) => {
                container.attr("transform", event.transform);
            });

        svg.call(zoomBehavior).call(zoomBehavior.transform, initialTransform);
    }, []); // Only run once: no dependencies so this effect won’t rerun

    useEffect(() => {
        if (!highlightedTraceLinks.length) return;

        for (const traceLink of highlightedTraceLinks) {
            const match = allNodes.find(n =>
                traceLink.codeElementId === n.data.path ||
                traceLink.codeElementId.startsWith(n.data.path!)
            );

            // Walk from matching node to root, expanding all collapsed parents
            let current = match;
            while (current && current.parent) {
                if (current.parent._children) {
                    current.parent.children = current.parent._children;
                    current.parent._children = null;
                }
                current = current.parent;
            }
        }
        // Force re-render by creating a new reference
        setTreeRoot(Object.assign(Object.create(Object.getPrototypeOf(treeRoot)), treeRoot));
    }, [highlightedTraceLinks]);


    return (
        <div className="relative w-full h-full bg-white overflow-hidden">
            <svg ref={svgRef} style={{width: "100%", height: "100%"}} viewBox={"-10 -10 600 800"}>
                <g ref={containerRef}>
                    {links.map((link, index) =>
                        <ACMLink
                            diagonal={diagonal}
                            link={link}
                            key={index}
                            isHighlighted={highlightedPaths.has(`${link.source.data.id}->${link.target.data.id}`)}
                        />)}
                    {nodes.map((node, index) =>
                        <ACMNode
                            node={node}
                            key={index}
                            treeRoot={treeRoot}
                            setTreeRoot={setTreeRoot}
                        />
                    )}
                </g>
            </svg>
        </div>
    );
}

