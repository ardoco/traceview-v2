import React from "react";
import {Edge} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";

interface UMLEdgeProps {
    edge: Edge;
    source: { x: number; y: number };
    target: { x: number; y: number };
}

export default function UMLEdge({ edge, source, target }: UMLEdgeProps) {

    // Lookup or compute source/target coordinates from component map


    let strokeDasharray = "";
    if (edge.type === "uml:Usage" || edge.type === "delegate") strokeDasharray = "4 2";

    return (
        <g>
            <defs>
                <marker
                    id="arrow"
                    markerWidth="10"
                    markerHeight="10"
                    refX="6"
                    refY="3"
                    orient="auto"
                    markerUnits="strokeWidth"
                >
                    <path d="M0,0 L6,3 L0,6" fill="none" stroke="black" strokeWidth="1.5"/>
                </marker>
            </defs>
            <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="black"
                strokeWidth={2}
                strokeDasharray={strokeDasharray}
                markerEnd="url(#arrow)"
            />
        </g>
    );
}
