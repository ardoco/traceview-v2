'use client'

import React, {useState} from "react";
import { ACMLayoutNode, CustomHierarchyNode } from "./ACMViewer"; // Adjust path if types are elsewhere
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";

type ACMNodeProps = {
    node: ACMLayoutNode;        // This node is from the layout (has x, y, id, and potentially _children from data)
    treeDataRoot: CustomHierarchyNode; // This is the full hierarchy data state object
    setTreeDataRoot: React.Dispatch<React.SetStateAction<CustomHierarchyNode>>; // Setter for the full tree data
}

export default function ACMNode({node, treeDataRoot, setTreeDataRoot}: ACMNodeProps) {
    const {highlightElement, highlightedTraceLinks, highlightingColor} = useHighlightContext();
    const [hovered, setHovered] = useState(false);

    // Note: node.data.path can be null, ensure null checks if using startsWith directly
    const isHighlightedByTraceLink = highlightedTraceLinks.some(traceLink =>
        node.data.path && traceLink.codeElementId === node.data.id
    );



    function textSymbol() {
        // 'node' is an ACMLayoutNode. Its 'children' are visible children after layout.
        // Its '_children' would reflect the original collapsed state from CustomHierarchyNode data.
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
                // Return a copy to trigger React's re-render
                setTreeDataRoot(Object.assign(Object.create(Object.getPrototypeOf(treeDataRoot)), treeDataRoot));

        } else {
            highlightElement(node.data.path ?? null, "codeElementId");
        }
    };

    return (
        <g transform={`translate(${node.y}, ${node.x})`} // In D3 tree layout, y is often depth (horizontal), x is breadth (vertical)
           onMouseOver={() => setHovered(true)}
           onMouseOut={() => setHovered(false)}
           onClick={handleClick}
           style={{ cursor: 'pointer' }}
        >
            <circle
                r={isHighlightedByTraceLink ? 6 : 4}
                fill={hovered ? "#D3D3D3" : isHighlightedByTraceLink ? highlightingColor : "#999"}
                strokeWidth={1} // Standard stroke width unless specifically needing wider for interaction
                stroke={hovered ? "#A9A9A9" : isHighlightedByTraceLink ? highlightingColor : "#555"} // Add a subtle stroke
            />
            {/* Render text symbol within the circle if desired, adjust position */}
            {textSymbol()}
            <text
                dy={"0.34em"}
                x={node.children || node._children ? -10 : 10} // Position based on if it's a parent or leaf
                textAnchor={node.children || node._children ? "end" : "start"}
                fill={"#333"} // Main text color
                fontSize={8}
                paintOrder={"stroke"}
                stroke={"white"} // Halo effect for better readability
                strokeWidth={0.5}
            >
                {node.data.name}
            </text>
        </g>
    );
}
