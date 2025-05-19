import React, {useState} from "react";
import {AbstractComponent, Interface} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";
import {
    hideTooltip,
    showInterfaceTooltip
} from "@/components/traceLinksResultViewer/umlComponentDiagram2/InterfaceTooltip";

export interface InterfaceAnchor { // used to draw edges between provided/required interfaces
    id: string; // interface/component ID
    type: "provided" | "required";
    position: { x: number; y: number };
    facingDirection: FacingDirection;
    interface: AbstractComponent; // component ID
}

export enum FacingDirection {
    LEFT = "left",
    RIGHT = "right",
    UP = "up",
    DOWN = "down",
}

export interface LollipopProps {
    x: number;
    y: number;
    facingVector: { x: number; y: number };
    usedInterface: Interface;
    svgRef: React.RefObject<SVGSVGElement> | null;
    setTooltip: (t: { x: number; y: number; content: React.ReactNode } | null) => void;
    radius?: number;
    lineLength?: number;


}

export function ProvidedLollipop({
                                     x,
                                     y,
                                     facingVector,
                                     usedInterface,
                                     svgRef,
                                     setTooltip,
                                     lineLength = 6,
                                     radius = 6,

                                 }: LollipopProps) {


    const fillColor = "white"; // tooltip ?  "lightblue" :
    const strokeColor = "black"; //  tooltip ?  "blue" :

    const norm = Math.hypot(facingVector.x, facingVector.y);
    const dx = (facingVector.x / norm) * lineLength;
    const dy = (facingVector.y / norm) * lineLength;

    const cx = x + dx + (facingVector.x / norm) * radius;
    const cy = y + dy + (facingVector.y / norm) * radius;

    return (
        <g>
            <line
                x1={x}
                y1={y}
                x2={x + dx}
                y2={y + dy}
                stroke={strokeColor}

            />
            <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill={fillColor}
                stroke={strokeColor}
            />


        </g>
    );
}

export function RequiredLollipop({
                                     x,
                                     y,
                                     facingVector,
                                     usedInterface,
                                     svgRef,
                                     setTooltip,
                                     lineLength = 6,
                                     radius = 6,
                                 }: LollipopProps) {
    const [hovered, setHovered] = useState(false);

    const strokeColor = hovered ? "blue" : "black";

    const norm = Math.hypot(facingVector.x, facingVector.y);
    const ux = facingVector.x / norm;
    const uy = facingVector.y / norm;

    const dx = ux * lineLength;
    const dy = uy * lineLength;

    const arcCenterX = x + dx + ux * radius;
    const arcCenterY = y + dy + uy * radius;

    const angle = Math.atan2(uy, ux);
    const angleDeg = (angle * 180) / Math.PI;

    return (
        <g>
            {/* Line */}
            <line
                x1={x}
                y1={y}
                x2={x + dx}
                y2={y + dy}
                stroke={strokeColor}
            />

            {/* Half-circle Path (open away from line) */}
            <path
                d={`
                    M ${arcCenterX - radius}, ${arcCenterY}
                    A ${radius} ${radius} 0 0 0 ${arcCenterX + radius}, ${arcCenterY}
                `}
                transform={`rotate(${angleDeg + 90}, ${arcCenterX}, ${arcCenterY})`}
                fill="none"
                stroke={strokeColor}
            />

        </g>
    );
}

