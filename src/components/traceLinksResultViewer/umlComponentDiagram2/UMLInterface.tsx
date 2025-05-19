import {Interface} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";
import {Position} from "@/components/traceLinksResultViewer/umlComponentDiagram2/UMLViewer2";
import React, {useState} from "react";
import {
    hideTooltip,
    showInterfaceTooltip
} from "@/components/traceLinksResultViewer/umlComponentDiagram2/InterfaceTooltip";

interface UMLInterfaceNodeProps {
    usedInterface: Interface;
    position: Position;
    setTooltip: (t: { x: number; y: number; content: React.ReactNode } | null) => void;
    svgRef: React.RefObject<SVGSVGElement> | null;
}

export default function UMLInterfaceNode({usedInterface, position, setTooltip, svgRef}: UMLInterfaceNodeProps) {
    const { x: posX, y: posY } = position;

    const displayName = usedInterface.name.length > 20 ? usedInterface.name.slice(0, 20) + "…" : usedInterface.name;
    const [hovered, setHovered] = useState(false);


    return (
        <g transform={`translate(${posX}, ${posY})`}>
            <text
                x={10}
                y={10}
                fontSize="12"
                fontFamily="sans-serif"
                fill={hovered ? "#00876c" : "black"}
                fontWeight={hovered ? "bold" : "normal"}
                style={{userSelect: 'none', cursor: 'default'}}
                onMouseEnter={(e) =>{
                    setHovered(true);
                    showInterfaceTooltip(svgRef, e.nativeEvent.layerX, e.nativeEvent.layerY, usedInterface, setTooltip, "Provided")}}
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