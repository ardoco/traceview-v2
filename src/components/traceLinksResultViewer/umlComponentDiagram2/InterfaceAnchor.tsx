import React, {useState} from "react";
import {AbstractComponent, Interface} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";

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
    facingDirection: FacingDirection;
    usedInterface: Interface;
    radius?: number;
    lineLength?: number;

}

export function ProvidedLollipop({
                                     x,
                                     y,
                                     facingDirection,
                                     usedInterface,
                                     lineLength = 6,
                                     radius = 6,
                                 }: LollipopProps) {
    const [hovered, setHovered] = useState(false);

    const fillColor = hovered ? "lightblue" : "white";
    const strokeColor = hovered ? "blue" : "black";

    const tooltipWidth = 200;
    const tooltipHeight = 80 + 20 * usedInterface.ownedOperations.length;

    const renderTooltip = () => (
        <foreignObject
            x={10}
            y={-tooltipHeight / 2}
            width={tooltipWidth}
            height={tooltipHeight}
        >
            <div xmlns="http://www.w3.org/1999/xhtml" style={{
                backgroundColor: "white",
                border: "1px solid ",
                borderRadius: "8px",
                padding: "8px",
                fontSize: "12px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                pointerEvents: "none",
                zIndex: -1,
            }}>

                <strong>Provided Interface:</strong><br/>
                {usedInterface.name}<br/>
                <div>
                    <strong>Operations:</strong>
                    <ul style={{margin: 0, paddingLeft: 16}}>
                        {usedInterface.ownedOperations.map(op => (
                            <li key={op.id}>{op.name}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </foreignObject>
    );

    const commonEvents = {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
    };

    const circle = <circle cx={0} cy={0} r={radius} fill={fillColor} stroke={strokeColor}{...commonEvents}/>
    const line = <line x1={0} y1={0} x2={-lineLength} y2={0} stroke={strokeColor} />;


    switch (facingDirection) {
        case FacingDirection.LEFT:
            return (
                <g transform={`translate(${x + lineLength + 2 * radius}, ${y})`}>
                    {line}
                    <g transform={`translate(${-lineLength - radius}, 0)`}>
                        {circle}
                    </g>
                    {/* Tooltip */}
                    {hovered && renderTooltip()}
                </g>
            );
        case FacingDirection.RIGHT:
            return (
                <g transform={`translate(${x - lineLength - 2 * radius}, ${y})`}>
                    <line x1={0} y1={0} x2={lineLength} y2={0} stroke={strokeColor} />
                    <g transform={`translate(${lineLength + radius}, 0)`}>
                        {circle}
                    </g>
                    {/* Tooltip */}
                    {hovered && renderTooltip()}
                </g>
            );
        case FacingDirection.UP:
            return (
                <g transform={`translate(${x}, ${y + lineLength + 2 * radius})`}>
                    <line x1={0} y1={0} x2={0} y2={-lineLength} stroke={strokeColor} />
                    <g transform={`translate(0, ${-lineLength - radius})`}>
                        {circle}
                    </g>
                    {/* Tooltip */}
                    {hovered && renderTooltip()}
                </g>
            );
        case FacingDirection.DOWN:
            return (
                <g transform={`translate(${x}, ${y - lineLength - 2 * radius})`}>
                    <line x1={0} y1={0} x2={0} y2={lineLength} stroke={strokeColor} />
                    <g transform={`translate(0, ${lineLength + radius})`}>
                        {circle}
                    </g>
                    {/* Tooltip */}
                    {hovered && renderTooltip()}
                </g>
            );
    }
}


export function RequiredLollipop({
                                     x,
                                     y,
                                     facingDirection,
                                     usedInterface,
                                     lineLength = 6,
                                     radius = 6,
                                 }: LollipopProps) {
    const [hovered, setHovered] = useState(false);

    const fillColor = hovered ? "lightblue" : "white";
    const strokeColor = hovered ? "blue" : "black";

    const tooltipWidth = 200;
    const tooltipHeight = 80 + 20 * usedInterface.ownedOperations.length;

    const getTooltipOffset = (direction: FacingDirection) => {
        switch (direction) {
            case FacingDirection.LEFT:
                return { x: 10, y: -tooltipHeight / 2 };
            case FacingDirection.RIGHT:
                return { x: -tooltipWidth - 10, y: -tooltipHeight / 2 };
            case FacingDirection.UP:
                return { x: -tooltipWidth / 2, y: -tooltipHeight - 10 };
            case FacingDirection.DOWN:
                return { x: -tooltipWidth / 2, y: 10 };
        }
    };

    const renderTooltip = () => {
        const offset = getTooltipOffset(facingDirection);
        return (
            <foreignObject
                x={offset.x}
                y={offset.y}
                width={tooltipWidth}
                height={tooltipHeight}
            >
                <div
                    xmlns="http://www.w3.org/1999/xhtml"
                    style={{
                        backgroundColor: "white",
                        border: "1px solid black",
                        borderRadius: "8px",
                        padding: "8px",
                        fontSize: "12px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                        pointerEvents: "none",
                        zIndex: -1,
                    }}
                >
                    <strong>Required Interface:</strong><br />
                    {usedInterface.name}<br />
                    <div>
                        <strong>Operations:</strong>
                        <ul style={{ margin: 0, paddingLeft: 16 }}>
                            {usedInterface.ownedOperations.map((op) => (
                                <li key={op.id}>{op.name}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </foreignObject>
        );
    };

    const commonEvents = {
        onMouseEnter: () => setHovered(true),
        onMouseLeave: () => setHovered(false),
    };

    switch (facingDirection) {
        case FacingDirection.LEFT:
            return (
                <g transform={`translate(${x + lineLength + 2 * radius}, ${y})`}>
                    <line x1={0} y1={0} x2={-lineLength} y2={0} stroke={strokeColor} {...commonEvents} />
                    <path
                        transform={`translate(${-lineLength}, 0)`}
                        d={`M ${-radius},${-radius} A ${radius},${radius} 0 0,1 ${-radius},${radius}`}
                        fill="none"
                        stroke={strokeColor}
                        {...commonEvents}
                    />
                    {hovered && renderTooltip()}
                </g>
            );

        case FacingDirection.RIGHT:
            return (
                <g transform={`translate(${x - lineLength - 2 * radius}, ${y})`}>
                    <line x1={0} y1={0} x2={lineLength} y2={0} stroke={strokeColor} {...commonEvents} />
                    <path
                        transform={`translate(${lineLength}, 0)`}
                        d={`M ${radius},${-radius} A ${radius},${radius} 0 0,0 ${radius},${radius}`}
                        fill="none"
                        stroke={strokeColor}
                        {...commonEvents}
                    />
                    {hovered && renderTooltip()}
                </g>
            );

        case FacingDirection.UP:
            return (
                <g transform={`translate(${x}, ${y + lineLength + 2 * radius})`}>
                    <line x1={0} y1={0} x2={0} y2={-lineLength} stroke={strokeColor} {...commonEvents} />
                    <path
                        transform={`translate(0, ${-lineLength})`}
                        d={`M ${-radius},${-radius} A ${radius},${radius} 0 0,0 ${radius},${-radius}`}
                        fill="none"
                        stroke={strokeColor}
                        {...commonEvents}
                    />
                    {hovered && renderTooltip()}
                </g>
            );

        case FacingDirection.DOWN:
            return (
                <g transform={`translate(${x}, ${y - lineLength - 2 * radius})`}>
                    <line x1={0} y1={0} x2={0} y2={lineLength} stroke={strokeColor} {...commonEvents} />
                    <path
                        transform={`translate(0, ${lineLength})`}
                        d={`M ${-radius},${radius} A ${radius},${radius} 0 0,1 ${radius},${radius}`}
                        fill="none"
                        stroke={strokeColor}
                        {...commonEvents}
                    />
                    {hovered && renderTooltip()}
                </g>
            );
    }
}