'use client'

import React, {useEffect, useMemo, useRef, useState} from "react";
import * as d3 from "d3";
import {CodeModelUnit} from "@/components/traceLinksResultViewer/views/codeModel/dataModel/ACMDataModel";
import ACMNode from "@/components/traceLinksResultViewer/views/codeModel/viewer/ACMNode";
import ACMLink from "@/components/traceLinksResultViewer/views/codeModel/viewer/ACMLink";
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";


export type HierarchyData = CodeModelUnit;

// Base D3 HierarchyNode
export interface CustomHierarchyNode extends d3.HierarchyNode<HierarchyData> {
    id: string;
    _children?: CustomHierarchyNode[];
}

export interface ACMLayoutNode extends d3.HierarchyPointNode<HierarchyData> {
    id: string;
    _children?: ACMLayoutNode[] | null;
}


type ACMViewerProps = {
    codeModel: CodeModelUnit;
}

const dx = 18; // vertical space between nodes (must be larger than the label font size)
const dy = 240; // horizontal space between levels
// Initial zoom never goes below this, so the labels (see ACMNode) stay readable. Users can still zoom out.
const minInitialScale = 1;

const collapseDepth = 2; // change as needed

function buildInitialTrees(codeModel: CodeModelUnit): { expanded: CustomHierarchyNode, collapsed: CustomHierarchyNode } {
    const root = d3.hierarchy<HierarchyData>(codeModel, d => d.children);

    root.eachBefore(dAny => {
        const d = dAny as CustomHierarchyNode;
        d.id = d.data.id;
    });

    const expanded = root.copy() as CustomHierarchyNode;

    function collapseAllDeeper(node: CustomHierarchyNode) {
        if (node.children) {
            node._children = node.children.map(child => {
                const childNode = child as CustomHierarchyNode;
                collapseAllDeeper(childNode);
                return childNode;
            });
            node.children = undefined;
        }
    }

    root.eachBefore(dAny => {
        const d = dAny as CustomHierarchyNode;
        if (d.depth === collapseDepth && d.children) {
            for (const child of d.children) {
                collapseAllDeeper(child as CustomHierarchyNode);
            }
        }
    });
    return {expanded, collapsed: root as CustomHierarchyNode};
}

const enhanceNode = (node: d3.HierarchyPointNode<HierarchyData>): ACMLayoutNode => {
    const acmLayoutNode = node as ACMLayoutNode;
    acmLayoutNode.id = node.data.id;

    if (acmLayoutNode.children) {
        acmLayoutNode.children = acmLayoutNode.children.map(child => enhanceNode(child as d3.HierarchyPointNode<HierarchyData>)) as ACMLayoutNode[];
    }
    return acmLayoutNode;
}

export default function ACMViewer({codeModel}: ACMViewerProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const zoomRef = useRef<SVGGElement | null>(null);
    const {highlightedTraceLinks} = useHighlightContext();
    // Both the expanded tree (used for highlighting) and the initially collapsed tree are built once.
    const [initialTrees] = useState(() => buildInitialTrees(codeModel));
    const copyExpandedTree = initialTrees.expanded;
    const [treeDataState, setTreeDataState] = useState<CustomHierarchyNode>(initialTrees.collapsed);


    const layoutedTreeRoot: ACMLayoutNode = useMemo(() => {
        const layout = d3.tree<HierarchyData>().nodeSize([dx, dy])(treeDataState);
        return enhanceNode(layout);
    }, [treeDataState]);

    const layoutedTreeRootStatic: ACMLayoutNode = useMemo(() => {
        const layout = d3.tree<HierarchyData>().nodeSize([dx, dy])(copyExpandedTree);
        return enhanceNode(layout);
    }, [copyExpandedTree]);

    const nodes: ACMLayoutNode[] = useMemo(() => layoutedTreeRoot.descendants(), [layoutedTreeRoot]);
    const nodes_all: ACMLayoutNode[] = useMemo(() => layoutedTreeRootStatic.descendants(), [layoutedTreeRootStatic]);

    const links = useMemo(() => {
        return layoutedTreeRoot.links() as unknown as d3.HierarchyPointLink<ACMLayoutNode>[];
    }, [layoutedTreeRoot]);


    // The diagonal function expects link objects where source and target are ACMLayoutNode
    const diagonal = d3.linkHorizontal<d3.HierarchyLink<ACMLayoutNode>, ACMLayoutNode>()
        .x(dNode => dNode.y)
        .y(dNode => dNode.x);


    const getPathsToHighlight = useMemo(() => {
        const getPathsToHighlight = new Set<string>();
        if (highlightedTraceLinks.length > 0 && nodes_all.length > 0) {
            for (const traceLink of highlightedTraceLinks) {
                const matchingNode = nodes_all.find(n =>
                    traceLink.codeElementId === n.data.id);
                if (!matchingNode) continue;
                const ancestor_ids = matchingNode.ancestors().map(n => (n as CustomHierarchyNode).id);

                // Create paths from ancestors to the matching node
                for (let i = ancestor_ids.length - 1; i > 0; i--) {
                    const key = `${ancestor_ids[i]}->${ancestor_ids[i - 1]}`;
                    getPathsToHighlight.add(key);
                }
            }
        }
        return getPathsToHighlight;
    }, [highlightedTraceLinks, nodes_all]);


    function getAllNodesForBBox(root: ACMLayoutNode): ACMLayoutNode[] {
        const allNodesList: ACMLayoutNode[] = [];

        function traverse(node: ACMLayoutNode) {
            allNodesList.push(node);

            const childrenToConsider = node.children || node._children;
            if (childrenToConsider) {
                for (const child of childrenToConsider) {
                    traverse(child);
                }
            }
        }

        traverse(root);
        return allNodesList;
    }

    function computeNodesBBox(nodesForBbox: ACMLayoutNode[]) {
        if (nodesForBbox.length === 0) return null;
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;

        for (const node of nodesForBbox) {
            if (node.y < minX) minX = node.y;
            if (node.y > maxX) maxX = node.y;
            if (node.x < minY) minY = node.x;
            if (node.x > maxY) maxY = node.x;
        }
        return {x: minX, y: minY, width: Math.max(maxX - minX, dy), height: Math.max(maxY - minY, dx)};
    }


    useEffect(() => {
        if (!svgRef.current || !zoomRef.current || nodes.length === 0) return;
        const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
        const zoomContainer = d3.select<SVGGElement, unknown>(zoomRef.current);

        const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.05, 8])
            .on("zoom", (event) => {
                zoomContainer.attr("transform", event.transform.toString());
            });
        svg.call(zoomBehavior);

        if (layoutedTreeRoot && layoutedTreeRoot.descendants().length > 0) {
            const allNodesForFit = getAllNodesForBBox(layoutedTreeRoot);
            const bbox = computeNodesBBox(allNodesForFit);
            if (!bbox || !svgRef.current) return;

            const svgWidth = svgRef.current.clientWidth;
            const svgHeight = svgRef.current.clientHeight;
            if (bbox.width === 0 || bbox.height === 0 || svgWidth === 0 || svgHeight === 0) return;

            const padding = 50;
            const scaleX = (svgWidth - padding * 2) / bbox.width;
            const scaleY = (svgHeight - padding * 2) / bbox.height;
            const fitScale = Math.min(scaleX, scaleY);
            const scale = Math.min(Math.max(fitScale, minInitialScale), 1.5);

            // If the whole tree fits, center it. Otherwise start at the root, leaving room for its label on the left.
            const fits = scale <= fitScale;
            const translateX = fits ? (svgWidth / 2) - scale * (bbox.x + bbox.width / 2) : Math.min(svgWidth / 3, 320) - scale * bbox.x;
            const translateY = fits ? (svgHeight / 2) - scale * (bbox.y + bbox.height / 2) : (svgHeight / 2) - scale * layoutedTreeRoot.x;

            const initialTransform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);
            svg.call(zoomBehavior.transform, initialTransform);
        }
    }, [layoutedTreeRoot, nodes]);


    // When the highlighted trace links change, expand the ancestors of the highlighted nodes.
    // The tree is mutated in place (like the d3 layout itself), so a new reference is needed to re-render.
    // Adjusting state during render, see https://react.dev/learn/you-might-not-need-an-effect
    const [prevHighlightedTraceLinks, setPrevHighlightedTraceLinks] = useState<typeof highlightedTraceLinks | null>(null);
    if (prevHighlightedTraceLinks !== highlightedTraceLinks) {
        setPrevHighlightedTraceLinks(highlightedTraceLinks);
        if (highlightedTraceLinks.length) {
            for (const traceLink of highlightedTraceLinks) {
                const current = layoutedTreeRootStatic.find(n =>
                    n.data.id === traceLink.codeElementId);
                if (!current) continue;
                const ancestor_ids = current.ancestors().map(n => (n as CustomHierarchyNode).id);
                ancestor_ids.shift(); // Remove the current node itself from the ancestors
                for (const anchestor_id of ancestor_ids.reverse()) {
                    const ancestorNode = layoutedTreeRoot.descendants().find(n => n.id == anchestor_id);
                    if (ancestorNode) {
                        // expand the ancestor node if it is collapsed
                        if (ancestorNode._children && ancestorNode.children === undefined) {
                            ancestorNode.children = ancestorNode._children;
                            ancestorNode._children = undefined;
                        }
                    }
                }
            }
            //Force re-render by creating a new reference
            setTreeDataState(Object.assign(Object.create(Object.getPrototypeOf(treeDataState)), treeDataState));
        }
    }

    return (
        <div className="relative w-full h-full bg-white overflow-hidden">
            <svg ref={svgRef} style={{width: "100%", height: "100%"}}>
                <g ref={zoomRef}>
                    {links.map((link, index) => (
                        <ACMLink
                            diagonal={diagonal}
                            link={link}
                            key={`${link.source.id}-${link.target.id}-${index}`}
                            isHighlighted={getPathsToHighlight.has(`${link.source.id}->${link.target.id}`)}
                        />
                    ))}
                    {nodes.map((node) => (
                        <ACMNode
                            node={node}
                            key={node.id}
                            treeDataRoot={treeDataState}
                            setTreeDataRoot={setTreeDataState}
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
}
