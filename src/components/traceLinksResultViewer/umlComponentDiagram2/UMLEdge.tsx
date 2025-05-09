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
    );
}
