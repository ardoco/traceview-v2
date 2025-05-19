import React from "react";
import {Edge, Interface} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";
import {
    ProvidedLollipop,
    RequiredLollipop
} from "@/components/traceLinksResultViewer/umlComponentDiagram2/InterfaceAnchor";

interface UMLEdgeProps {
    edge: Edge;
    client: { x: number; y: number };
    supplier: { x: number; y: number };
    svgRef: React.RefObject<SVGSVGElement> | null;
    setTooltip: (t: { x: number; y: number; content: React.ReactNode } | null) => void;

}

export default function UMLEdge({ edge, client, supplier, svgRef, setTooltip }: UMLEdgeProps) {
    let strokeDasharray = "";
    if (edge.type === "uml:Usage" || edge.type === "delegate") strokeDasharray = "4";

    let clientX = client.x + 70;
    let clientY = client.y + 35;

    const dx = supplier.x - clientX;
    const dy = supplier.y - clientY;
    const fullLength = Math.hypot(dx, dy);
    const direction = { x: dx, y: dy };

    // make coordinates centered: for usage: make client centered, for delegate make client centered
    if (edge.type === "uml:Usage") {
        const lollipopLength = Math.min(fullLength - 10, 100); // Ensure some space left
        const unitX = dx / fullLength;
        const unitY = dy / fullLength;

        const lollipopEndX = clientX + unitX * (lollipopLength + 6);
        const lollipopEndY = clientY + unitY * (lollipopLength + 6);

        return (
            <g>
                <RequiredLollipop
                    x={clientX}
                    y={clientY}
                    facingVector={direction}
                    usedInterface={edge.usedInterface as Interface}
                    svgRef={svgRef}
                    setTooltip={setTooltip}
                    radius={6}
                    lineLength={lollipopLength}
                />

                {lollipopLength < fullLength && (
                    <line
                        x1={lollipopEndX}
                        y1={lollipopEndY}
                        x2={supplier.x}
                        y2={supplier.y}
                        stroke="black"
                        strokeWidth={1.5}
                        strokeDasharray={strokeDasharray}
                        markerEnd="url(#arrow)"
                    />
                )}

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
                        <path d="M0,0 L6,3 L0,6" fill="none" stroke="black" strokeWidth="1.5" />
                    </marker>
                </defs>
            </g>
        );


    } else if (edge.type == "uml:InterfaceRealization") {
        return(
            <ProvidedLollipop
                x={clientX}
                y={clientY}
                facingVector={{
                    x: supplier.x - clientX,
                    y: supplier.y - clientY,
                }}
                usedInterface={edge.usedInterface as Interface}
                svgRef={svgRef}
                setTooltip={setTooltip}
                radius={6}
                lineLength={Math.hypot(supplier.x - clientX, supplier.y - clientY) - 14}
            />
        )
    }

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
                x1={clientX}
                y1={clientY}
                x2={supplier.x}
                y2={supplier.y}
                stroke="black"
                strokeDasharray={strokeDasharray}
                markerEnd="url(#arrow)"
            />
        </g>
    );
}
