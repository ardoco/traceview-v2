'use client'

import React, {useState} from "react";
import {
    ProvidedLollipop,
    RequiredLollipop
} from "@/components/traceLinksResultViewer/views/architectureModel/viewer/LollipopEdges";
import {Edge} from "@/components/traceLinksResultViewer/views/architectureModel/dataModel/ArchitectureDataModel";
import {
    hideTooltip,
    showInterfaceTooltip
} from "@/components/traceLinksResultViewer/views/architectureModel/viewer/InterfaceTooltip";
import {Position} from "@/components/traceLinksResultViewer/views/architectureModel/viewer/UMLViewer";
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";
import {useInconsistencyContext} from "@/contexts/HighlightInconsistencyContext";
import {ResultType} from "@/components/dataTypes/ResultType";

const COMPONENT_WIDTH = 140;
const COMPONENT_HEIGHT = 70;
const COMPONENT_CENTER_OFFSET_X = COMPONENT_WIDTH / 2;
const COMPONENT_CENTER_OFFSET_Y = COMPONENT_HEIGHT / 2;

const LOLLIPOP_RADIUS = 6;
const HOVERED_LOLLIPOP_RADIUS = 8;

const DEFAULT_STROKE_WIDTH = 1.5;
const HOVER_STROKE_WIDTH = 2.5;
const DEFAULT_STROKE_COLOR = "black";
const HOVER_COLOR = "var(--color-black-700)";

const STROKE_DASH_ARRAY = "4";

interface UMLEdgeProps {
    edge: Edge;
    client: Position;
    supplier: Position;
    svgRef: React.RefObject<SVGSVGElement>;
    setTooltip: (tooltip: { x: number; y: number; content: React.ReactNode } | null) => void;
    isShortLink?: boolean;
}

export default function UMLEdge({
                                    edge,
                                    client,
                                    supplier,
                                    svgRef,
                                    setTooltip,
                                    isShortLink = false
                                }: UMLEdgeProps) {

    const [hovered, setHovered] = useState(false);
    if (!svgRef.current) return null;

    // Adjust client/supplier coordinates for component nodes to be closer to center
    let startX = client.x + COMPONENT_CENTER_OFFSET_X;
    let startY = client.y + COMPONENT_CENTER_OFFSET_Y;

    let endX = supplier.x + COMPONENT_CENTER_OFFSET_X;
    let endY = supplier.y + COMPONENT_CENTER_OFFSET_Y;

    if (edge.type === "uml:InterfaceRealization" || edge.type === "uml:Usage") {
        endX = supplier.x + 10;
        endY = supplier.y + 10;
    }
    const {highlightElement, highlightedTraceLinks} = useHighlightContext();
    const {
        highlightInconsistencyWithModelId,
        highlightedModelInconsistencies,
    } = useInconsistencyContext();

    const isTraceLinkHighlighted = highlightedTraceLinks.some(link => link.modelElementId === edge.usedInterface?.id) || false;
    const isInconsistencyHighlighted = highlightedModelInconsistencies.some(inconsistency => inconsistency.id === edge.usedInterface?.id) || false;

    const fillColor =
        isTraceLinkHighlighted ? "var(--color-highlight-tracelink-text)" :
        isInconsistencyHighlighted ? "var(--color-highlight-inconsistency-text)" :
            hovered ? HOVER_COLOR : DEFAULT_STROKE_COLOR;
    const strokeWidth =
        (hovered || isTraceLinkHighlighted || isInconsistencyHighlighted) ? HOVER_STROKE_WIDTH : DEFAULT_STROKE_WIDTH;
    const lollipopRadius =
        (hovered || isTraceLinkHighlighted || isInconsistencyHighlighted) ? HOVERED_LOLLIPOP_RADIUS : LOLLIPOP_RADIUS;
    const markerId =
        isTraceLinkHighlighted ? "arrow-traceLinks" :
            isInconsistencyHighlighted ? "arrow-inconsistencies" :
                hovered ? "arrow-hovered" : "arrow-default";

    const markerDefs = (
        <defs>
            <marker id={"arrow-default"} markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto"
                    markerUnits="strokeWidth">
                <path d="M0,0 L6,3 L0,6" fill="none" stroke={DEFAULT_STROKE_COLOR} strokeWidth={DEFAULT_STROKE_WIDTH}/>
            </marker>
            <marker id={"arrow-hovered"} markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto"
                    markerUnits="strokeWidth">
                <path d="M0,0 L6,3 L0,6" fill="none" stroke={HOVER_COLOR} strokeWidth={HOVER_STROKE_WIDTH}/>
            </marker>
            <marker id={"arrow-inconsistencies"} markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto"
                    markerUnits="strokeWidth">
                <path d="M0,0 L6,3 L0,6" fill="none" stroke={"var(--color-highlight-inconsistency-text)"} strokeWidth={HOVER_STROKE_WIDTH}/>
            </marker>
            <marker id={"arrow-traceLinks"} markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto"
                    markerUnits="strokeWidth">
                <path d="M0,0 L6,3 L0,6" fill="none" stroke={"var(--color-highlight-tracelink-text)"} strokeWidth={HOVER_STROKE_WIDTH}/>
            </marker>
        </defs>
    );

    let dx = endX - startX;
    let dy = endY - startY;
    const totalLength = Math.hypot(dx, dy);

    if (totalLength === 0) return null;
    const unitX = dx / totalLength;
    const unitY = dy / totalLength;

    if (edge.type == "virtual:mergedEdge") {
        const textX = (startX + endX) / 2;
        const textY = (startY + endY) / 2;
        const lollipopLength = Math.max(0, 0.5 * totalLength - 20);

        const requiredLollipopEndX = endX - unitX * (lollipopLength + LOLLIPOP_RADIUS);
        const requiredLollipopEndY = endY - unitY * (lollipopLength + LOLLIPOP_RADIUS);

        const providedLollipopEndX = startX + unitX * (lollipopLength + 20);
        const providedLollipopEndY = startY + unitY * (lollipopLength + 20);

        return (
            <g
                onMouseEnter={(e) => {
                if (edge.usedInterface) {
                    showInterfaceTooltip(svgRef, e.nativeEvent.layerX, e.nativeEvent.layerY, edge.usedInterface, setTooltip, "Provided");
                }
                setHovered(true);
                }}
               onMouseLeave={() => {
                   hideTooltip(setTooltip)
                   setHovered(false);
               }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (edge.usedInterface) {
                        highlightElement(edge.usedInterface.id, ResultType.Architecture_Model);
                        highlightInconsistencyWithModelId(edge.usedInterface.id);
                    }
                }}
            >
                {markerDefs}
                <RequiredLollipop
                    x={endX}
                    y={endY}
                    facingVector={{x: -unitX, y: -unitY}} // Facing towards the client
                    radius={lollipopRadius}
                    lineLength={lollipopLength}
                    strokeColor={fillColor}
                    strokeWidth={strokeWidth}
                />

                {lollipopLength < totalLength * 0.5 && (
                    <line
                        x1={requiredLollipopEndX}
                        y1={requiredLollipopEndY}
                        x2={providedLollipopEndX}
                        y2={providedLollipopEndY}
                        strokeWidth={strokeWidth}
                        strokeDasharray={STROKE_DASH_ARRAY}
                        markerEnd={`url(#${markerId})`}

                        stroke={fillColor}
                    />
                )}

                <ProvidedLollipop
                    x={startX}
                    y={startY}
                    facingVector={{x: unitX, y: unitY}}
                    radius={lollipopRadius}
                    lineLength={0.5 * totalLength - 14}
                    strokeColor={fillColor}
                    strokeWidth={strokeWidth}
                />

                <text
                    x={textX}
                    y={textY - 10} // Adjust text position slightly above the line
                    textAnchor="middle"
                    fontSize="12"
                    fontFamily="sans-serif"
                    fill={fillColor}
                    fontWeight={(hovered || isTraceLinkHighlighted || isInconsistencyHighlighted) ? "bold" : "normal"}
                    style={{userSelect: 'none', cursor: 'default'}}
                >
                    {edge.usedInterface?.name}
                </text>
            </g>
        );

    } else if (edge.type === "uml:Usage") {

        dx = supplier.x - startX;
        dy = supplier.y - startY;
        const fullLength = Math.hypot(dx, dy);
        const direction = {x: dx, y: dy};

        const unitX = dx / fullLength;
        const unitY = dy / fullLength;

        let lollipopLength = Math.min(fullLength - 10, 100); // Ensure some space left
        if (isShortLink) {
            lollipopLength = Math.hypot(COMPONENT_CENTER_OFFSET_X, COMPONENT_CENTER_OFFSET_Y) * 1.25;
        }

        const lollipopEndX = startX + unitX * (lollipopLength + LOLLIPOP_RADIUS);
        const lollipopEndY = startY + unitY * (lollipopLength + LOLLIPOP_RADIUS);

        return (
            <g onMouseEnter={(e) => {
                if (edge.usedInterface) {
                    showInterfaceTooltip(svgRef, e.nativeEvent.layerX, e.nativeEvent.layerY, edge.usedInterface, setTooltip, "Provided");
                }
                setHovered(true);
            }}
               onMouseLeave={() => {
                   hideTooltip(setTooltip)
                   setHovered(false);
               }}>
                {markerDefs}
                <RequiredLollipop
                    x={startX}
                    y={startY}
                    facingVector={direction}
                    radius={lollipopRadius}
                    lineLength={lollipopLength}
                    strokeColor={fillColor}
                    strokeWidth={strokeWidth}
                />

                {!isShortLink && lollipopLength < fullLength && (
                    <line
                        x1={lollipopEndX}
                        y1={lollipopEndY}
                        x2={supplier.x}
                        y2={supplier.y}
                        stroke={fillColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={STROKE_DASH_ARRAY}
                        markerEnd={`url(#${markerId})`}
                    />
                )}
            </g>
        );


    } else if (edge.type == "uml:InterfaceRealization") {
        let lineLength = Math.hypot(supplier.x - startX, supplier.y - startY) - 14;
        if (isShortLink) {
            lineLength = Math.hypot(COMPONENT_CENTER_OFFSET_X, COMPONENT_CENTER_OFFSET_Y) * 1.5;
        }

        const textX = startX + (lineLength + 20) * (supplier.x - startX) / Math.hypot(supplier.x - startX, supplier.y - startY)
        const textY = startY + (lineLength + 20) * (supplier.y - startY) / Math.hypot(supplier.x - startX, supplier.y - startY)

        return (
            <g onMouseEnter={(e) => {
                if (edge.usedInterface) {
                    showInterfaceTooltip(svgRef, e.nativeEvent.layerX, e.nativeEvent.layerY, edge.usedInterface, setTooltip, "Provided");
                }
                setHovered(true);
            }}
               onMouseLeave={() => {
                   hideTooltip(setTooltip)
                   setHovered(false);
               }}
               onClick={(e) => {
                   e.stopPropagation();
                   if (edge.usedInterface) {
                       highlightElement(edge.usedInterface.id, ResultType.Architecture_Model);
                       highlightInconsistencyWithModelId(edge.usedInterface.id);
                   }
               }}
            >
                <ProvidedLollipop
                    x={startX}
                    y={startY}
                    facingVector={{
                        x: supplier.x - startX,
                        y: supplier.y - startY,
                    }}
                    radius={lollipopRadius}
                    lineLength={lineLength}
                    strokeColor={fillColor}
                    strokeWidth={strokeWidth}
                />

                {isShortLink && (
                    <text
                        x={textX}
                        y={textY}
                        textAnchor="middle"
                        fontSize="12"
                        fontFamily="sans-serif"
                        fill={fillColor}
                        fontWeight={(hovered || isTraceLinkHighlighted || isInconsistencyHighlighted) ? "bold" : "normal"}
                        style={{userSelect: 'none', cursor: 'default'}}
                    >
                        {edge.usedInterface?.name}
                    </text>
                )}
            </g>

        )
    } else {
        // General edge rendering with arrow
        return (
            <g>
                {markerDefs}
                <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={DEFAULT_STROKE_COLOR}
                    strokeWidth={strokeWidth}
                    markerEnd={`url(#${markerId})`}

                    strokeDasharray={STROKE_DASH_ARRAY}
                />
            </g>
        );
    }
}
