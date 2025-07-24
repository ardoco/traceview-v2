import React from "react";
import { Position } from "@/components/traceLinksResultViewer/views/architectureModel/viewer/UMLViewer";
import { useHighlightContext } from "@/contexts/HighlightContextType";
import {Component} from "@/components/traceLinksResultViewer/views/architectureModel/dataModel/ArchitectureDataModel";

// --- Utility to measure text width ---
function measureTextWidth(text: string, font: string): number {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return 0;
    context.font = font;
    return context.measureText(text).width;
}

interface UMLNodeProps {
    component: Component;
    position: Position;
}

function wrapText(text: string, maxWidth: number, font: string): string[] {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) return [text];
    context.font = font;

    const measure = (s: string) => context.measureText(s).width;

    const parts = text.split(/(?=[A-Z])/g); // split on camel case
    const lines: string[] = [];
    let currentLine = "";

    for (const part of parts) {
        const tentative = currentLine === "" ? part : `${currentLine}${part}`;
        const width = measure(tentative);

        if (width <= maxWidth) {
            currentLine = tentative;
        } else {
            if (currentLine !== "") {
                lines.push(currentLine);
                currentLine = "";
            }

            // check if part itself is too long
            if (measure(part) <= maxWidth) {
                currentLine = part;
            } else {
                // force split the long part
                let chunk = "";
                for (const char of part) {
                    const testChunk = chunk + char;
                    if (measure(testChunk) > maxWidth) {
                        lines.push(chunk);
                        chunk = char;
                    } else {
                        chunk = testChunk;
                    }
                }
                currentLine = chunk;
            }
        }
    }

    if (currentLine !== "") {
        lines.push(currentLine);
    }

    return lines;
}

export default function UMLNode({ component, position }: UMLNodeProps) {
    const { x: posX, y: posY } = position;
    const { highlightElement, highlightedTraceLinks, highlightingColor } = useHighlightContext();

    const fontSize = 12;
    const fontFamily = "sans-serif";
    const lineHeight = 16;
    const padding = 20;
    const maxWidth = 200;
    const minWidth = 140;

    const font = `${fontSize}px ${fontFamily}`;

    // Wrap text into multiple lines
    const textLines = wrapText(component.name, maxWidth - padding, font);

    const widestLine = Math.max(...textLines.map(line => measureTextWidth(line, font)));
    const calculatedWidth = Math.min(Math.max(widestLine + padding, minWidth), maxWidth);
    const calculatedHeight = 40 + textLines.length * lineHeight; // 40 for <<component>>#

    const isHighlighted = highlightedTraceLinks.some(
        traceLink => traceLink.modelElementId === component.id
    );

    return (
        <g
            transform={`translate(${posX}, ${posY})`}
            onClick={(event) => {
                event.stopPropagation();
                highlightElement(component.id ?? null, "modelElementId");
            }}
        >
            {component.name}

            <rect
                width={calculatedWidth}
                height={calculatedHeight}
                fill={isHighlighted ? highlightingColor : "#ffffff"}
                stroke="#4b5563"
            />
            <text
                x={calculatedWidth / 2}
                y={lineHeight}
                textAnchor="middle"
                fontSize={fontSize}
            >
                {"<<component>>"}
            </text>

            {textLines.map((line, index) => (
                <text
                    key={index}
                    x={calculatedWidth / 2}
                    y={lineHeight * (2 + index) + 6} // start second line below <<component>>
                    textAnchor="middle"
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    fontWeight="bold"
                >
                    {line}
                </text>
            ))}

            {/* UML component symbol (top-right corner) */}
            <g transform={`translate(${calculatedWidth - 16}, 6)`}>
                <rect width={10} height={14} fill="white" stroke="black" />
                <rect y={2} x={-4} width={8} height={3} fill="white" stroke="black" />
                <rect y={7} x={-4} width={8} height={3} fill="white" stroke="black" />
            </g>
        </g>
    );
}
