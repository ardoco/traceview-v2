import React, {useRef, useState, useEffect} from "react";
import {AbstractComponent, Component, Edge} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";
import UMLEdge from "@/components/traceLinksResultViewer/umlComponentDiagram2/UMLEdge";
import UMLNode from "@/components/traceLinksResultViewer/umlComponentDiagram2/UMLComponentNode";
import {forceCenter, forceLink, forceManyBody, forceSimulation, select} from "d3";
import * as d3 from "d3";
import {
    FacingDirection,
    InterfaceAnchor
} from "@/components/traceLinksResultViewer/umlComponentDiagram2/InterfaceAnchor";


interface UMLViewerProps {
    umlComponents: AbstractComponent[];
    umlEdges: Edge[];
}

export interface Position {
    x: number;
    y: number;
}

export default function UMLViewer2({ umlComponents, umlEdges }: UMLViewerProps) {
    const svgRef = useRef<SVGSVGElement |null >(null);
    const zoomRef = useRef<SVGGElement | null >(null);

    const positions = useForceLayout(umlComponents, umlEdges);
    const [interfaceAnchors, setInterfaceAnchors] = useState<{ [componentId: string]: InterfaceAnchor[] }>({});

    const [anchorsReady, setAnchorsReady] = useState(false);

    function isComponent(comp: AbstractComponent): comp is Component {
        return comp.type === "uml:Component";
    }
    const umlComponentsFiltered: Component[] = umlComponents.filter(isComponent);

    const umlComponentsMap = new Map<string, AbstractComponent>();
    umlComponents.forEach((comp) => {
        umlComponentsMap.set(comp.id, comp);
    });

    const processedEdges = anchorsReady
        ? umlEdges.map((edge) => {

            const sourceAnchors = interfaceAnchors[edge.client];
            const targetAnchors = interfaceAnchors[edge.supplier];

            // Find the anchor which is intended for this edge
            const sourceAnchor = sourceAnchors?.find(a =>edge.usedInterface?.id === a.interface.id); // Adjust logic here based on edge/interface info

            const targetAnchor = targetAnchors?.find(a => edge.usedInterface?.id === a.interface.id);
            return {
                ...edge,
                sourcePosition: sourceAnchor?.position || { x: positions[edge.client]?.x, y: positions[edge.client]?.y },
                targetPosition: targetAnchor?.position || { x: positions[edge.supplier]?.x, y: positions[edge.supplier]?.y },
            };
        })
        : [];




    useEffect(() => {
        const svg = d3.select(svgRef.current);
        const g = d3.select(zoomRef.current);

        // @ts-ignore
        svg.call(
            d3.zoom()
                .on("zoom", (event) => {
                    g.attr("transform", event.transform);
                })
        );
    }, []);

    useEffect(() => {
        const anchorMap: { [componentId: string]: InterfaceAnchor[] } = {};
        umlComponentsFiltered.forEach((component) => {
            const position = positions[component.id];
            if (position) {
                anchorMap[component.id] = calculateAnchorsForComponent(component, position, umlComponentsMap);
            }
        });
        setInterfaceAnchors(anchorMap);
        setAnchorsReady(true);
    }, [positions]);


    return (
        <div className={"relative w-full h-full bg-white overflow-auto"}>
        <svg ref={svgRef}  style={{width: "100%", height: "100%"}} viewBox="-500 -500 2000 2000">
            <g ref={zoomRef}>



                {/* Render Components */}
                {umlComponentsFiltered.map((comp) => (
                    <UMLNode
                        key={comp.id}
                        component={comp}
                        position={{x: positions[comp.id]?.x ?? 0, y: positions[comp.id]?.y ?? 0}}
                        interfacePositions={interfaceAnchors[comp.id] ?? []}
                    />
                ))}

                {anchorsReady &&
                    processedEdges.map((edge, i) => (
                        <UMLEdge
                            key={i}
                            edge={edge}
                            source={edge.sourcePosition}
                            target={edge.targetPosition}
                        />
                    ))}
            </g>
        </svg>
        </div>
    );
}

const useForceLayout = (nodes: AbstractComponent[], edges: Edge[]) => {
    const [positions, setPositions] = useState<{ [id: string]: { x: number; y: number } }>({});

    useEffect(() => {
        const simNodes = nodes.map(d => ({...d}));
        const simLinks = edges.map(d => ({
            ...d,
            source: d.client,
            target: d.supplier
        }));
        console.log("similinks", simLinks);
        console.log("edges", edges);

        const simulation = forceSimulation(simNodes as any)
            .force('link', forceLink(simLinks).id((d: any) => d.id).distance(200))
            .force('charge', forceManyBody().strength(-400))
            .force(
                "collision",
                d3.forceCollide().radius((d) => Math.min((d as any).width, 150)),
            )
            .force('center', forceCenter(window.innerWidth / 2, window.innerHeight / 2))
            .on('tick', () => {
                const updated = {} as any;
                simNodes.forEach(node => {
                    updated[node.id] = {x: node.x!, y: node.y!};
                });
                setPositions(updated);
            });

        return () => (simulation.stop() as never);
    }, [nodes, edges]);

    return positions;
}

function calculateAnchorsForComponent(component: Component, position: Position, umlComponentsMap: Map<string, AbstractComponent>): InterfaceAnchor[] {
    const boxWidth = 140;
    const boxHeight = 70;
    const lollipopRadius = 6;
    const lollipopLineLength = 6;

    const totalInterfaces = component.providedInterfaces.length + component.usages.length;
    const quotient = Math.floor(totalInterfaces / 4);
    const remainder = totalInterfaces % 4;
    const interfacesPerSide = [quotient, quotient, quotient, quotient];
    for (let i = 0; i < remainder; i++) interfacesPerSide[i]++;

    const directions = [FacingDirection.UP, FacingDirection.DOWN, FacingDirection.LEFT, FacingDirection.RIGHT];
    const stepSizes = [
        [boxWidth / (interfacesPerSide[0] + 1), 0],
        [boxWidth / (interfacesPerSide[1] + 1), 0],
        [0, boxHeight / (interfacesPerSide[2] + 1)],
        [0, boxHeight / (interfacesPerSide[3] + 1)],
    ];
    const relativeOffsets = [
        [0, 0],
        [0, boxHeight],
        [0, 0],
        [boxWidth, 0],
    ];

    const positionsOnBox: InterfaceAnchor[] = [];

    let interfaceIndex = 0;
    for (let side = 0; side < 4; side++) {
        const stepSize = stepSizes[side];
        for (let j = 0; j < interfacesPerSide[side]; j++) {
            const x = position.x + stepSize[0] * (j + 1) + relativeOffsets[side][0];
            const y = position.y + stepSize[1] * (j + 1) + relativeOffsets[side][1];
            const direction = directions[side];

            const isProvided = interfaceIndex < component.providedInterfaces.length;
            const interfaceId = isProvided
                ? component.providedInterfaces[interfaceIndex]
                : component.usages[interfaceIndex - component.providedInterfaces.length];

            const endpoint = getLollipopEndPoint(x, y, direction, lollipopRadius, lollipopLineLength);

            positionsOnBox.push({
                id: component.id,
                type: isProvided ? "provided" : "required",
                position: endpoint,
                facingDirection: direction,
                interface: umlComponentsMap.get(interfaceId) ?? component,
            });

            interfaceIndex++;
        }
    }

    return positionsOnBox;
}

function getLollipopEndPoint(x: number, y: number, direction: FacingDirection, radiusLollipop: number, lineLength: number): Position {
    switch (direction) {
        case FacingDirection.LEFT:
            return { x: x - lineLength - 2*radiusLollipop , y };
        case FacingDirection.RIGHT:
            return { x: x + lineLength + 2*radiusLollipop, y };
        case FacingDirection.UP:
            return { x, y: y - lineLength - 2*radiusLollipop };
        case FacingDirection.DOWN:
            return { x, y: y + lineLength + 2*radiusLollipop };
    }
}
