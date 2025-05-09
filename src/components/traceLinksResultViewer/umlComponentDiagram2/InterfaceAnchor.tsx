import React from "react";
import {AbstractComponent} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";

export interface InterfaceAnchor { // used to draw edges between provided/required interfaces
    id: string; // interface/component ID
    type: "provided" | "required";
    position: { x: number; y: number };
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
    radius?: number;
    lineLength?: number;
}

export function ProvidedLollipop({ x, y, facingDirection, lineLength=6, radius=6 }: LollipopProps) {


    switch (facingDirection) {
        case FacingDirection.LEFT:
            return (
                <g transform={`translate(${x}, ${y})`}>
                    <line x1={0} y1={0} x2={-lineLength} y2={0} stroke="black"/>
                    <circle cx={- lineLength - radius} cy={0} r={radius} fill="white" stroke="black"/>
                </g>
            )

        case FacingDirection.RIGHT:
            return (
                <g transform={`translate(${x}, ${y})`}>
                    <line x1={0} y1={0} x2={lineLength} y2={0} stroke="black"/>
                    <circle cx={lineLength + radius} cy={0} r={radius} fill="white" stroke="black"/>
                </g>
            )

        case FacingDirection.UP:
            return (
                <g transform={`translate(${x}, ${y})`}>
                    <line x1={0} y1={0} x2={0} y2={-lineLength} stroke="black"/>
                    <circle cx={0} cy={-lineLength - radius} r={radius} fill="white" stroke="black"/>
                </g>
            )

        case FacingDirection.DOWN:
            return (
                <g transform={`translate(${x}, ${y})`}>
                    <line x1={0} y1={0} x2={0} y2={lineLength} stroke="black"/>
                    <circle cx={0} cy={lineLength + radius} r={radius} fill="white" stroke="black"/>
                </g>
            )

    }
}

export function RequiredLollipop({ x, y, facingDirection, lineLength=6, radius=6 }: LollipopProps) {

    switch (facingDirection) {
        case FacingDirection.LEFT:
            return (
                <g transform={`translate(${x}, ${y})`}>
                    <line x1={0} y1={0} x2={-lineLength} y2={0} stroke="black"/>
                    <path
                        transform={`translate(${-lineLength}, 0)`}
                        d={`M ${-radius},${-radius} A ${radius},${radius} 0 0,1 ${-radius},${radius}`}
                        fill="none"
                        stroke="black"
                    />
                </g>
            );

        case FacingDirection.RIGHT:
            return (
                <g transform={`translate(${x}, ${y})`}>
                    <line x1={0} y1={0} x2={lineLength} y2={0} stroke="black"/>
                    <path
                        transform={`translate(${lineLength}, 0)`}
                        d={`M ${radius},${-radius} A ${radius},${radius} 0 0,0 ${radius},${radius}`}
                        fill="none"
                        stroke="black"
                    />
                </g>
            );

        case FacingDirection.UP:
            return (
                <g transform={`translate(${x}, ${y})`}>
                    <line x1={0} y1={0} x2={0} y2={-lineLength} stroke="black"/>
                    <path
                        transform={`translate(0, ${-lineLength})`}
                        d={`M ${-radius},${-radius} A ${radius},${radius} 0 0,0 ${radius},${-radius}`}
                        fill="none"
                        stroke="black"
                    />
                </g>
            );

        case FacingDirection.DOWN:
            return (
                <g transform={`translate(${x}, ${y})`}>
                    <line x1={0} y1={0} x2={0} y2={lineLength} stroke="black"/>
                    <path
                        transform={`translate(0, ${lineLength})`}
                        d={`M ${-radius},${radius} A ${radius},${radius} 0 0,1 ${radius},${radius}`}
                        fill="none"
                        stroke="black"
                    />
                </g>
            );
    }


}