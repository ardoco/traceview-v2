import React, {useEffect, useRef, useState} from "react";
import {AbstractComponent, Component} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";
import {Position} from "@/components/traceLinksResultViewer/umlComponentDiagram2/UMLViewer2";
import {
    FacingDirection,
    InterfaceAnchor,
    ProvidedLollipop, RequiredLollipop
} from "@/components/traceLinksResultViewer/umlComponentDiagram2/InterfaceAnchor";


interface UMLNodeProps {
    component: Component;
    position: Position;
    addAnchors: (anchors: InterfaceAnchor[], componentId: string) => void;
    umlComponentsMap: Map<string, AbstractComponent>;
}

export default function UMLNode({ component, position, addAnchors, umlComponentsMap }: UMLNodeProps) {
    const { x: posX, y: posY } = position;

    const [textWidth, setTextWidth] = useState(140); // default width
    const [interfacePositions, setInterfacePositions] = useState<[number, number, FacingDirection][]>([]);
    const textRef = useRef<SVGTextElement>(null);
    const hasAddedAnchors = useRef(false);

    const padding = 20;
    const lineHeight = 16;

    const boxHeight = 70;
    const boxWidth = textWidth;

    const lollipopRadius = 6;
    const lollipopLineLength = 6;

    useEffect(() => {
        if (textRef.current) {
            const bbox = textRef.current.getBBox();
            setTextWidth(Math.min(140, bbox.width + padding));
        }
    }, []);



    // calculate positions of provided/required interfaces



    const interfacePositionsOnBox = () => {

        // Step 1. Calculate the number of provided and required interfaces in total
        const totalInterfaces = component.providedInterfaces.length + component.usages.length;

        // Step 2: determine how many interfaces per side (get a 4 values array)
        const quotient = Math.floor(totalInterfaces / 4); // 4 as there are 4 sides in a rectangle
        const remainder = totalInterfaces % 4;
        const directions = [FacingDirection.UP, FacingDirection.DOWN, FacingDirection.LEFT, FacingDirection.RIGHT];
        const interfacesPerSide = [quotient, quotient, quotient, quotient]; // [top, bottom, left, right]
        for (let i = 0; i < remainder; i++) {
            interfacesPerSide[i]++;
        }

        //Step 3: calculate the positions of provided and required interfaces
        const stepSizes = [
            [boxWidth / (interfacesPerSide[0] + 1), 0],                  // TOP
            [boxWidth / (interfacesPerSide[1] + 1), 0],                  // BOTTOM
            [0, boxHeight / (interfacesPerSide[2] + 1)],                 // LEFT
            [0, boxHeight / (interfacesPerSide[3] + 1)],                 // RIGHT
        ];

        const relativeOffsets = [
            [0, 0],         // TOP
            [0, boxHeight], // BOTTOM
            [0, 0],         // LEFT
            [boxWidth, 0],  // RIGHT
        ];

        const positionsOnBox: [number, number, FacingDirection][] = [];
        for (let i = 0; i < 4; i++) {
            const stepSize = stepSizes[i];
            for (let j = 0; j < interfacesPerSide[i]; j++) {
                positionsOnBox.push([
                    stepSize[0] * (j + 1) + relativeOffsets[i][0],
                    stepSize[1] * (j + 1) + relativeOffsets[i][1],
                    directions[i],
                ]);
            }
        }
        return positionsOnBox;

    }

    const getLollipopEndPoint = (x: number, y: number, direction: FacingDirection):Position => {
        console.log("find lollipop positions: ", posX, posY, x, y, direction);
        switch (direction) {
            case FacingDirection.LEFT:
                return {x: posX + x - lollipopLineLength - lollipopRadius, y: posY + y} as Position;
            case FacingDirection.RIGHT:
                return {x: posX + x + lollipopLineLength + lollipopRadius, y: posY + y} as Position;
            case FacingDirection.UP:
                return {x: posX + x, y: posY + y - lollipopRadius - lollipopRadius} as Position;
            case FacingDirection.DOWN:
                return {x: posX + x, y: posY + y + lollipopLineLength + lollipopRadius} as Position;
        }
    }

    useEffect(() => {
        if (!hasAddedAnchors.current) {
            const positionsOnBox = interfacePositionsOnBox();
            setInterfacePositions(positionsOnBox);

            const anchors: InterfaceAnchor[] = [];
            positionsOnBox.forEach(([x, y, direction], i) => {
                const isProvided = i < component.providedInterfaces.length;
                const interfaceId = isProvided ? component.providedInterfaces[i] : component.usages[i - component.providedInterfaces.length];
                anchors.push({
                    id: component.id,
                    type: isProvided ? "provided" : "required",
                    position: getLollipopEndPoint(x, y, direction),
                    interface: umlComponentsMap.get(interfaceId) ?? component,
                });
            });

            addAnchors(anchors, component.id);
            hasAddedAnchors.current = true;
        }
    }, [component, umlComponentsMap, addAnchors]);


    return (

        <g transform={`translate(${posX}, ${posY})`}>
            <rect width={boxWidth} height={boxHeight} fill="#ffffff" stroke="#4b5563"/>
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

            {interfacePositionsOnBox().map(([x, y, direction], i) => {
                const isProvided = i < component.providedInterfaces.length;
                return isProvided ? (
                    <ProvidedLollipop
                        key={`p-${i}`}
                        x={x}
                        y={y}
                        facingDirection={direction}
                        radius={lollipopRadius}
                        lineLength={lollipopLineLength}
                    />
                ) : (
                    <RequiredLollipop
                        key={`r-${i}`}
                        x={x}
                        y={y}
                        facingDirection={direction}
                        radius={lollipopRadius}
                        lineLength={lollipopLineLength}
                    />
                );
            })}

        </g>
    );
}
