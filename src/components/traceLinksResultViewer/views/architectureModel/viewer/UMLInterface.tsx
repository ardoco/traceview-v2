'use client'

import {Position} from "@/components/traceLinksResultViewer/views/architectureModel/viewer/UMLViewer";
import React, {useState} from "react";
import {
    hideTooltip,
    showInterfaceTooltip
} from "@/components/traceLinksResultViewer/views/architectureModel/viewer/InterfaceTooltip";
import {Interface} from "@/components/traceLinksResultViewer/views/architectureModel/dataModel/ArchitectureDataModel";

interface UMLInterfaceNodeProps {
    usedInterface: Interface;
    position: Position;
    setTooltip: (t: { x: number; y: number; content: React.ReactNode } | null) => void;
    svgRef: React.RefObject<SVGSVGElement>;
}

export default function UMLInterfaceNode({usedInterface, position, setTooltip, svgRef}: UMLInterfaceNodeProps) {
    const displayName = usedInterface?.name.length > 20 ? usedInterface?.name.slice(0, 20) + "…" : usedInterface.name;
    const [hovered, setHovered] = useState(false);

    if (!svgRef.current) return null;

    return (
        <g transform={`translate(${position.x}, ${position.y})`}>
            <text
                x={10}
                y={25} // Position text below the circle
                fontSize="12"
                fontFamily="sans-serif"
                textAnchor="middle" // Center the text horizontally
                fill={hovered ? "#00876c" : "black"}
                fontWeight={hovered ? "bold" : "normal"}
                style={{userSelect: 'none', cursor: 'default'}}
                onMouseEnter={(e) => {
                    setHovered(true);
                    showInterfaceTooltip(svgRef, e.nativeEvent.layerX, e.nativeEvent.layerY, usedInterface, setTooltip, "Provided")
                }}
                onMouseLeave={() => {
                    hideTooltip(setTooltip)
                    setHovered(false);
                }}
            >
                {displayName}
            </text>
        </g>
    );
}