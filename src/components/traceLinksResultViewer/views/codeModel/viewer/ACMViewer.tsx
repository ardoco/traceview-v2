'use client'

import React, {useEffect, useMemo, useRef, useState} from "react";
import * as d3 from "d3";
import {CodeModelUnit} from "@/components/traceLinksResultViewer/views/codeModel/dataModel/ACMDataModel";
import ACMNode from "@/components/traceLinksResultViewer/views/codeModel/viewer/ACMNode";
import ACMLink from "@/components/traceLinksResultViewer/views/codeModel/viewer/ACMLink";
import {useHighlightContext} from "@/components/traceLinksResultViewer/views/HighlightContextType";


export type HierarchyData = CodeModelUnit;

// Base D3 HierarchyNode with our custom 'id' and '_children' properties.
export interface CustomHierarchyNode extends d3.HierarchyNode<HierarchyData> {
    id: string;
    _children?: CustomHierarchyNode[];
}

export interface ACMLayoutNode extends d3.HierarchyPointNode<HierarchyData> {
    id: string;
    _children?: ACMLayoutNode[] | null; // If _children are also to be layout nodes
}


type ACMViewerProps = {
    codeModel: CodeModelUnit;
}

const dx = 10; // vertical space between nodes
const dy = 200; // horizontal space between levels

export default function ACMViewer({codeModel}: ACMViewerProps) {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const zoomRef = useRef<SVGGElement | null>(null);

    const copyExpandedTree = useRef<CustomHierarchyNode | null>(null);

    const [treeDataState, setTreeDataState] = useState<CustomHierarchyNode>(() => {
        const root = d3.hierarchy<HierarchyData>(codeModel, d => d.children);

        const collapseDepth = 2; // change as needed

        root.eachBefore(dAny => {
            const d = dAny as CustomHierarchyNode;
            d.id = d.data.id;
        });

        copyExpandedTree.current = root.copy() as CustomHierarchyNode;

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
        return root as CustomHierarchyNode;
    });


    const layoutedTreeRoot: ACMLayoutNode = useMemo(() => {
        const layout = d3.tree<HierarchyData>().nodeSize([dx, dy])(treeDataState);

        function enhanceNode(node: d3.HierarchyPointNode<HierarchyData>): ACMLayoutNode {
            const acmLayoutNode = node as ACMLayoutNode;
            acmLayoutNode.id = node.data.id; // Set id from original data

            if (acmLayoutNode.children) {
                acmLayoutNode.children = acmLayoutNode.children.map(child => enhanceNode(child as d3.HierarchyPointNode<HierarchyData>)) as ACMLayoutNode[];
            }
            return acmLayoutNode;
        }
        return enhanceNode(layout);
    }, [treeDataState]);

    const layoutedTreeRootStatic: ACMLayoutNode = useMemo(() => {
        const layout = d3.tree<HierarchyData>().nodeSize([dx, dy])(copyExpandedTree.current!);

        function enhanceNode(node: d3.HierarchyPointNode<HierarchyData>): ACMLayoutNode {
            const acmLayoutNode = node as ACMLayoutNode;
            acmLayoutNode.id = node.data.id; // Set id from original data

            if (acmLayoutNode.children) {
                acmLayoutNode.children = acmLayoutNode.children.map(child => enhanceNode(child as d3.HierarchyPointNode<HierarchyData>)) as ACMLayoutNode[];
            }
            return acmLayoutNode;
        }
        return enhanceNode(layout);
    }, [treeDataState]);

    const nodes: ACMLayoutNode[] = useMemo(() => layoutedTreeRoot.descendants(), [layoutedTreeRoot]);
    const nodes_all: ACMLayoutNode[] =  useMemo(() => layoutedTreeRootStatic.descendants(), [layoutedTreeRootStatic]);

    const links = useMemo(() => {
        return layoutedTreeRoot.links() as unknown as d3.HierarchyPointLink<ACMLayoutNode>[];
    }, [layoutedTreeRoot]);


    // The diagonal function expects link objects where source and target are ACMLayoutNode
    const diagonal = d3.linkHorizontal<d3.HierarchyLink<ACMLayoutNode>, ACMLayoutNode>()
        .x(dNode => dNode.y)
        .y(dNode => dNode.x);

    const {highlightedTraceLinks} = useHighlightContext();

    const highlightedPaths = useMemo(() => {
        const paths = new Set<string>();
        if (highlightedTraceLinks.length > 0 && nodes_all.length > 0) {
            for (const traceLink of highlightedTraceLinks) {
                const matchingNode = nodes_all.find(n =>
                    traceLink.codeElementId === n.data.id);

                let current: ACMLayoutNode | null | undefined = matchingNode;
                while (current && current.parent) {
                    const parentNode = current.parent as ACMLayoutNode; // Parent from layouted tree is ACMLayoutNode
                    const key = `${parentNode.id}->${current.id}`;
                    paths.add(key);
                    current = parentNode;
                }
            }
        }
        return paths;
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
        return { x: minX, y: minY, width: Math.max(maxX - minX, dy), height: Math.max(maxY - minY, dx) };
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
            let scale = Math.min(scaleX, scaleY);
            scale = Math.min(scale, 1.5);
            scale = Math.max(scale, 0.1);

            const translateX = (svgWidth / 2) - scale * (bbox.x + bbox.width / 2);
            const translateY = (svgHeight / 2) - scale * (bbox.y + bbox.height / 2);

            const initialTransform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);
            svg.call(zoomBehavior.transform, initialTransform);
        }
    }, [layoutedTreeRoot, nodes]);


    useEffect(() => {
        if (!highlightedTraceLinks.length) return;

        for (const traceLink of highlightedTraceLinks) {
            // const current = layoutedTreeRootStatic.find(n =>
            //     n.data.path === traceLink.codeElementId ||
            //     (!!n.data.path && traceLink.codeElementId.startsWith(n.data.path + "."))
            // );
            const current = layoutedTreeRootStatic.find(n =>
                n.data.id === traceLink.codeElementId);
            if (!current) continue;
            const ancestor_ids = current.ancestors().map(n => (n as CustomHierarchyNode).id);
            for (const anchestor_id of ancestor_ids.reverse()) {
                const ancestorNode = nodes.find(n => n.id === anchestor_id);
                if (ancestorNode) {
                    // expand the ancestor node if it is collapsed
                    if (ancestorNode._children && ancestorNode.children === undefined) {
                        ancestorNode.children = ancestorNode._children;
                        ancestorNode._children = undefined;
                    }
                }
            }
        }
        // Force re-render by creating a new reference
        setTreeDataState(Object.assign(Object.create(Object.getPrototypeOf(treeDataState)), treeDataState));

    }, [highlightedTraceLinks]);


    return (
        <div className="relative w-full h-full bg-white overflow-hidden">
            <svg ref={svgRef} style={{width: "100%", height: "100%"}}>
                <g ref={zoomRef}>
                    {links.map((link, index) => (
                        <ACMLink
                            diagonal={diagonal}
                            link={link}
                            key={`${link.source.id}-${link.target.id}-${index}`}
                            isHighlighted={highlightedPaths.has(`${link.source.id}->${link.target.id}`)}
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
