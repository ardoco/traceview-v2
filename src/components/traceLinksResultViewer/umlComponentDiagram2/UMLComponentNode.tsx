import React, {useEffect, useRef, useState} from "react";
import {AbstractComponent, Component, Interface} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";
import {Position} from "@/components/traceLinksResultViewer/umlComponentDiagram2/UMLViewer2";
import {
    FacingDirection,
    InterfaceAnchor,
    ProvidedLollipop, RequiredLollipop
} from "@/components/traceLinksResultViewer/umlComponentDiagram2/InterfaceAnchor";
import {useHighlightContext} from "@/components/traceLinksResultViewer/util/HighlightContextType";


interface UMLNodeProps {
    component: Component;
    position: Position;
    interfacePositions: InterfaceAnchor[];
}

export default function UMLNode({ component, position, interfacePositions }: UMLNodeProps) {
    const { x: posX, y: posY } = position;

    const [textWidth, setTextWidth] = useState(140); // default width
    const textRef = useRef<SVGTextElement>(null);
    const {highlightElement, highlightedTraceLinks} = useHighlightContext();

    const padding = 20;
    const lineHeight = 16;

    const boxHeight = 70;
    const boxWidth = 140;

    const lollipopRadius = 6;
    const lollipopLineLength = 6;

    return (

        <g transform={`translate(${posX}, ${posY})`}
           onClick={event => {
               console.log(component.id);
               event.stopPropagation();
               highlightElement(component.id?? null, "codeElementId");
           }}>
            <rect
                width={boxWidth}
                height={boxHeight}
                fill={highlightedTraceLinks.some(traceLink => traceLink.codeElementId == component.id) ?"#fde68a" : "#ffffff"}
                stroke="#4b5563"/>
            <text
                ref={textRef}
                x={boxWidth / 2}
                y={boxHeight / 2 - 2}
                textAnchor="middle"
                fontSize="12">
                {"<<component>>"}
            </text>
            <text
                x={boxWidth / 2}
                y={boxHeight / 2 + 14}
                textAnchor="middle"
                fontWeight="bold"
                fontSize="12"
                fontFamily="sans-serif"
            >
                {component.name}
            </text>

            {/* UML component symbol (top-right corner) */}
            <g transform={`translate(${boxWidth - 16}, 6)`}>
                <rect width={10} height={14} fill="white" stroke="black" />
                <rect y={2} x={-4} width={8} height={3} fill="white" stroke="black" />
                <rect y={7} x={-4} width={8} height={3} fill="white" stroke="black" />
            </g>

            {/* TODO: notify UMLViewer about the positions of the lollypops, name interfaces*/}

            {interfacePositions.map((anchor, i) =>
                anchor.type === "provided" ? (
                    <ProvidedLollipop
                        key={`p-${i}`}
                        x={anchor.position.x - posX }
                        y={anchor.position.y - posY}
                        facingDirection={anchor.facingDirection}
                        usedInterface={anchor.interface as Interface}
                        radius={lollipopRadius}
                        lineLength={lollipopLineLength}
                    />
                ) : (
                    <RequiredLollipop
                        key={`r-${i}`}
                        x={anchor.position.x - posX }
                        y={anchor.position.y - posY }
                        facingDirection={anchor.facingDirection}
                        usedInterface={anchor.interface as Interface}
                        radius={lollipopRadius}
                        lineLength={lollipopLineLength}
                    />
                )
            )}

        </g>
    );
}
