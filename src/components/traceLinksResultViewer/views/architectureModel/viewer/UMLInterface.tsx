import {Position} from "@/components/traceLinksResultViewer/views/architectureModel/viewer/UMLViewer";
import React, {useState} from "react";
import {
    hideTooltip,
    showInterfaceTooltip
} from "@/components/traceLinksResultViewer/views/architectureModel/viewer/InterfaceTooltip";
import {Interface} from "@/components/traceLinksResultViewer/views/architectureModel/dataModel/ArchitectureDataModel";
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";
import {useInconsistencyContext} from "@/contexts/HighlightInconsistencyContext";
import {DisplayOption} from "@/components/dataTypes/DisplayOption";

interface UMLInterfaceNodeProps {
    usedInterface: Interface;
    position: Position;
    setTooltip: (t: { x: number; y: number; content: React.ReactNode } | null) => void;
    svgRef: React.RefObject<SVGSVGElement>;
}

export default function UMLInterfaceNode({usedInterface, position, setTooltip, svgRef}: UMLInterfaceNodeProps) {
    const {highlightElement, highlightedTraceLinks} = useHighlightContext();
    const {
        highlightInconsistencyWithModelId,
        highlightedModelInconsistencies,
    } = useInconsistencyContext();

    const displayName = usedInterface?.name.length > 20 ? usedInterface?.name.slice(0, 20) + "…" : usedInterface.name;
    const [hovered, setHovered] = useState(false);

    const isTraceLinkHighlighted = highlightedTraceLinks.some(link => link.modelElementId === usedInterface.id);
    const isInconsistencyHighlighted = highlightedModelInconsistencies.some(inconsistency => inconsistency.id === usedInterface.id);

    if (!svgRef.current) return null;

    return (
        <g
            transform={`translate(${position.x}, ${position.y})`}
            onClick={(e) => {
                e.stopPropagation();
                highlightElement(usedInterface.id, DisplayOption.ARCHITECTURE_MODEL);
                highlightInconsistencyWithModelId(usedInterface.id);
            }}
        >

            <text
                x={10}
                y={25}
                fontSize="12"
                fontFamily="sans-serif"
                textAnchor="middle"
                fill={isTraceLinkHighlighted ? "var(--color-highlight-tracelink)" : isInconsistencyHighlighted ? "var(--color-highlight-inconsistency)" : hovered ? "#00876c" : "black"}
                fontWeight={(hovered || isTraceLinkHighlighted || isInconsistencyHighlighted) ? "bold" : "normal"}
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