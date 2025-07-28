'use client'

import React, {useState} from "react";
import { ACMLayoutNode, CustomHierarchyNode } from "./ACMViewer";
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";

type ACMNodeProps = {
    node: ACMLayoutNode;       // node is from the layout (has x, y, id, and potentially _children from data)
    treeDataRoot: CustomHierarchyNode; // full hierarchy data state object
    setTreeDataRoot: React.Dispatch<React.SetStateAction<CustomHierarchyNode>>;
}

export default function ACMNode({node, treeDataRoot, setTreeDataRoot}: ACMNodeProps) {
    const {highlightElement, highlightedTraceLinks} = useHighlightContext();
    const [hovered, setHovered] = useState(false);

    const isHighlightedByTraceLink = highlightedTraceLinks.some(traceLink =>
        node.data.path && traceLink.codeElementId === node.data.id
    );



    function textSymbol() {
        // 'node' is an ACMLayoutNode. Its 'children' are visible children after layout.
        if (node.children && node.children.length > 0) return <text dy=".3em" textAnchor="middle" fontSize={8} fill="white">−</text>;
        if (node._children && node._children.length > 0) return <text dy=".3em" textAnchor="middle" fontSize={8} fill="white">+</text>;
        return null;
    }

    const handleClick = (event: React.MouseEvent<SVGGElement, MouseEvent>) => {
        event.stopPropagation();

        if (event.ctrlKey) {
                // Find the corresponding node in the mutable treeData structure
                const targetNodeInTreeData = treeDataRoot.descendants().find(n => n.id === node.id);

                if (targetNodeInTreeData) {
                    const target = targetNodeInTreeData as CustomHierarchyNode; // Cast to access _children
                    if (target.children) { // If currently expanded, collapse it
                        target._children = target.children;
                        target.children = undefined;
                    } else { // If currently collapsed, expand it
                        target.children = target._children;
                        target._children = undefined;
                    }
                }
                // Return a copy to trigger re-render
                setTreeDataRoot(Object.assign(Object.create(Object.getPrototypeOf(treeDataRoot)), treeDataRoot));

        } else {
            highlightElement(node.data.path ?? null, "codeElementId");
        }
    };

    return (
        <g transform={`translate(${node.y}, ${node.x})`}
           onMouseOver={() => setHovered(true)}
           onMouseOut={() => setHovered(false)}
           onClick={handleClick}
           style={{ cursor: 'pointer' }}
        >
            <circle
                r={isHighlightedByTraceLink ? 6 : 4}
                fill={hovered ? "#D3D3D3" : isHighlightedByTraceLink ? "var(--color-highlight-tracelink)" : "#999"}
                strokeWidth={1}
                stroke={hovered ? "#A9A9A9" : isHighlightedByTraceLink ? "var(--color-highlight-tracelink)" : "#555"}
            />

            {textSymbol()}
            <text
                dy={"0.34em"}
                x={node.children || node._children ? -10 : 10}
                textAnchor={node.children || node._children ? "end" : "start"}
                fill={"#333"}
                fontSize={8}
                paintOrder={"stroke"}
                stroke={"white"}
                strokeWidth={0.5}
            >
                {node.data.name}
            </text>
        </g>
    );
}
