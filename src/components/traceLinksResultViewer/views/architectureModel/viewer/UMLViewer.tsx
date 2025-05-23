import React, {useRef, useState, useEffect} from "react";
import UMLEdge from "@/components/traceLinksResultViewer/views/architectureModel/viewer/UMLEdge";
import UMLNode from "@/components/traceLinksResultViewer/views/architectureModel/viewer/UMLComponentNode";
import {forceCenter, forceLink, forceManyBody, forceSimulation, select} from "d3";
import * as d3 from "d3";
import UMLInterfaceNode from "@/components/traceLinksResultViewer/views/architectureModel/viewer/UMLInterface";
import {
    AbstractComponent,
    Component,
    Edge,
    Interface
} from "@/components/traceLinksResultViewer/views/architectureModel/dataModel/ArchitectureDataModel";


interface UMLViewerProps {
    umlComponents: AbstractComponent[];
    umlEdges: Edge[];
}

export interface Position {
    x: number;
    y: number;
}

export default function UMLViewer({ umlComponents, umlEdges }: UMLViewerProps) {
    const svgRef = useRef<SVGSVGElement |null >(null);
    const zoomRef = useRef<SVGGElement | null >(null);

    const [tooltip, setTooltip] = useState<{
        x: number;
        y: number;
        content: React.ReactNode;
    } | null>(null);

    const positions = useForceLayout(umlComponents, umlEdges);

    function isComponent(comp: AbstractComponent): comp is Component {
        return comp.type === "uml:Component";
    }

    function isInterface(comp: AbstractComponent): comp is Interface {
        return comp.type === "uml:Interface";
    }

    const umlComponentsFiltered: Component[] = umlComponents.filter(isComponent);
    const umlInterfacesFiltered: Interface[] = umlComponents.filter(isInterface) as Interface[];

    const umlComponentsMap = new Map<string, AbstractComponent>();
    umlComponents.forEach((comp) => {
        umlComponentsMap.set(comp.id, comp);
    });


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


    return (
        <div className={"relative w-full h-full bg-white overflow-hidden"}>
        <svg ref={svgRef}  style={{width: "100%", height: "100%"}} viewBox="-500 -500 2000 2000">
            <g ref={zoomRef}>


                {umlEdges.map((edge, i) => (
                    <UMLEdge
                        key={i}
                        edge={edge}
                        client={positions[edge.client] ?? {x: 0, y: 0}}
                        supplier={positions[edge.supplier] ?? {x: 0, y: 0}}
                        svgRef={svgRef}
                        setTooltip={setTooltip}
                    />
                ))}

                {/* Render Components */}
                {umlComponentsFiltered.map((comp) => (
                    <UMLNode
                        key={comp.id}
                        component={comp}
                        position={{x: positions[comp.id]?.x ?? 0, y: positions[comp.id]?.y ?? 0}}
                    />
                ))}

                {/* Render Interfaces */}
                {umlInterfacesFiltered.map((iface) => (
                    <UMLInterfaceNode
                        key={iface.id}
                        usedInterface={iface}
                        position={{x: positions[iface.id]?.x ?? 0, y: positions[iface.id]?.y ?? 0}}
                        setTooltip={setTooltip}
                        svgRef={svgRef}
                    />
                ))}

            </g>
        </svg>

            {tooltip && (
                <div
                    style={{
                        position: 'absolute',
                        left: tooltip.x,
                        top: tooltip.y,
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        zIndex: 1000,
                        pointerEvents: 'none',
                        maxWidth: 240,
                        fontFamily: 'sans-serif',
                    }}
                >
                    {tooltip.content}
                </div>
            )}
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
            .force('link', forceLink(simLinks)
                .id((d: any) => d.id)
                .distance(200)
                .strength(1))
            .force('charge', forceManyBody().strength(-400))
            .force('collision', d3.forceCollide().radius(() => 100).strength(1.2))
            .force('x', d3.forceX().strength(0.05))
            .force('y', d3.forceY().strength(0.05))
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
