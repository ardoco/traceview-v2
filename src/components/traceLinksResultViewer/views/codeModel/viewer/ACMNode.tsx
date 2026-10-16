'use client'

import React, {useRef, useState} from "react";
import {ACMLayoutNode, CustomHierarchyNode} from "./ACMViewer";
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";
import {DisplayOption} from "@/components/dataTypes/DisplayOption";

type ACMNodeProps = {
    node: ACMLayoutNode;       // node is from the layout (has x, y, id, and potentially _children from data)
    treeDataRoot: CustomHierarchyNode;
    setTreeDataRoot: React.Dispatch<React.SetStateAction<CustomHierarchyNode>>;
}

export default function ACMNode({node, treeDataRoot, setTreeDataRoot}: ACMNodeProps) {
    const {highlightElement, highlightedTraceLinks, lastClickedSource} = useHighlightContext();
    const [hovered, setHovered] = useState(false);

    const isHighlightedByTraceLink = highlightedTraceLinks.some(traceLink =>
        node.data.path && traceLink.codeElementId === node.data.id
    );

    const isSource = lastClickedSource?.type === DisplayOption.CODE_MODEL && lastClickedSource?.id === node.data.id;

    function textSymbol() {
        // 'node' is an ACMLayoutNode. Its 'children' are visible children after layout.
        if (node.children && node.children.length > 0) return <text dy=".3em" textAnchor="middle" fontSize={8}
                                                                    fill="white">−</text>;
        if (node._children && node._children.length > 0) return <text dy=".3em" textAnchor="middle" fontSize={8}
                                                                      fill="white">+</text>;
        return null;
    }

    // Expands or collapses the node. The tree is mutated in place, so a new root reference is needed to re-render.
    const toggleCollapse = () => {
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
        setTreeDataRoot(Object.assign(Object.create(Object.getPrototypeOf(treeDataRoot)), treeDataRoot));
    };

    // On macOS, browsers treat Ctrl + Click as a right click: they fire "contextmenu" (with the left button) instead of "click".
    // That gesture is handled here, and remembered so that a browser that fires "click" as well does not toggle twice.
    const toggledByContextMenu = useRef(false);

    const handleContextMenu = (event: React.MouseEvent<SVGGElement, MouseEvent>) => {
        if (event.ctrlKey && event.button === 0) {
            event.preventDefault();
            event.stopPropagation();
            toggledByContextMenu.current = true;
            toggleCollapse();
        }
    };

    const handleClick = (event: React.MouseEvent<SVGGElement, MouseEvent>) => {
        event.stopPropagation();

        if (event.ctrlKey || event.metaKey) {
            if (!toggledByContextMenu.current) {
                toggleCollapse();
            }
        } else {
            highlightElement(node.data.id ?? null, DisplayOption.CODE_MODEL);
        }
    };

    return (
        <g transform={`translate(${node.y}, ${node.x})`}
           onMouseOver={() => setHovered(true)}
           onMouseOut={() => setHovered(false)}
           // pointerdown, because d3-zoom stops the propagation of mousedown
           onPointerDown={() => {
               toggledByContextMenu.current = false;
           }}
           onContextMenu={handleContextMenu}
           onClick={handleClick}
           style={{cursor: 'pointer'}}
        >
            <circle
                r={isHighlightedByTraceLink ? 6 : 4}
                fill={hovered ? "#D3D3D3" : isHighlightedByTraceLink || isSource ? "var(--color-highlight-tracelink)" : "#999"}
                strokeWidth={1}
                stroke={hovered ? "#A9A9A9" : isSource ? "var(--color-highlight-tracelink-text)" : (isHighlightedByTraceLink ? "var(--color-highlight-tracelink)" : "#555")}
                strokeDasharray={isSource ? "4 2" : "none"}
            />

            {textSymbol()}
            <text
                dy={"0.34em"}
                x={node.children || node._children ? -12 : 12}
                textAnchor={node.children || node._children ? "end" : "start"}
                fill={"#333"}
                fontSize={12}
                paintOrder={"stroke"}
                stroke={"white"}
                strokeWidth={2}
            >
                {node.data.name}
            </text>
        </g>
    );
}
