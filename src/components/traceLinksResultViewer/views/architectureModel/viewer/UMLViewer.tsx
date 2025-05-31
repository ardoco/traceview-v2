'use client'

import React, { useRef, useState, useEffect, useMemo } from "react";
import * as d3 from "d3";
import UMLEdge from "@/components/traceLinksResultViewer/views/architectureModel/viewer/UMLEdge";
import UMLNode from "@/components/traceLinksResultViewer/views/architectureModel/viewer/UMLComponentNode";
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
    const svgRef = useRef<SVGSVGElement>(null!);
    const zoomRef = useRef<SVGGElement | null>(null);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null);

    const isComponent = (comp: AbstractComponent): comp is Component => comp.type === "uml:Component";
    const isInterface = (comp: AbstractComponent): comp is Interface => comp.type === "uml:Interface";

    const {
        processedComponents,
        processedEdges,
        passThroughInterfaceMap,
        interfaceProvidedCounts,
        interfaceUsedCounts,
        singleInterfaces
    } = useMemo(() => processUMLData(umlComponents, umlEdges), [umlComponents, umlEdges]);

    const positions = useForceLayout(processedComponents, processedEdges);

    useEffect(() => {
        if (!svgRef.current || !zoomRef.current) return;

        const svg = d3.select<SVGSVGElement, unknown>(svgRef.current);
        const g = d3.select<SVGGElement, unknown>(zoomRef.current);

        svg.call(
            d3.zoom<SVGSVGElement, unknown>()
                .on("zoom", (event) => {
                    g.attr("transform", event.transform);
                })
        );
    }, []);


    const umlInterfacesFilteredForRendering = umlComponents.filter(isInterface).filter(iface => {
        return !passThroughInterfaceMap.has(iface.id) && !singleInterfaces.has(iface.id);
    });

    return (
        <div className="relative w-full h-full">
            <svg ref={svgRef} className="w-full h-full border rounded" style={{ userSelect: "none" }}>
                <g ref={zoomRef}>
                    {processedEdges.map((edge, index) => {
                        const clientNode = positions[edge.client];
                        const supplierNode = positions[edge.supplier];

                        let isShortLink = false;
                        if (edge.usedInterface) {
                            const { id } = edge.usedInterface;
                            const providedCount = interfaceProvidedCounts.get(id) || 0;
                            const usedCount = interfaceUsedCounts.get(id) || 0;
                            isShortLink = (providedCount === 1 && usedCount === 0) || (providedCount === 0 && usedCount === 1);
                        }

                        return clientNode && supplierNode ? (
                            <UMLEdge
                                key={index}
                                edge={edge}
                                client={clientNode}
                                supplier={supplierNode}
                                svgRef={svgRef}
                                setTooltip={setTooltip}
                                isShortLink={isShortLink}
                            />
                        ) : null;
                    })}

                    {processedComponents.filter(isComponent).map(comp => {
                        const pos = positions[comp.id];
                        return pos ? <UMLNode key={comp.id} component={comp} position={pos} /> : null;
                    })}

                    {umlInterfacesFilteredForRendering.map(iface => {
                        const pos = positions[iface.id];
                        return pos ? (
                            <UMLInterfaceNode
                                key={iface.id}
                                usedInterface={iface}
                                position={pos}
                                setTooltip={setTooltip}
                                svgRef={svgRef}
                            />
                        ) : null;
                    })}
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
                    }}>
                    {tooltip.content}
                </div>
            )}
        </div>
    );
}

function processUMLData(umlComponents: AbstractComponent[], umlEdges: Edge[]) {
    const componentMap = new Map(umlComponents.map(c => [c.id, c]));
    const interfaceProvidedCounts = new Map<string, number>();
    const interfaceUsedCounts = new Map<string, number>();
    const interfaceProvidingComponent = new Map<string, string>();
    const interfaceUsingComponent = new Map<string, string>();
    const virtualEdges: Edge[] = [];
    const passThroughInterfaces = new Set<string>();
    const singleInterfaces = new Set<string>();

    umlEdges.forEach(edge => {
        const supplier = componentMap.get(edge.supplier);
        if (supplier instanceof Interface) {
            if (edge.type === "uml:InterfaceRealization") {
                interfaceProvidedCounts.set(supplier.id, (interfaceProvidedCounts.get(supplier.id) || 0) + 1);
                interfaceProvidingComponent.set(supplier.id, edge.client);
            } else if (edge.type === "uml:Usage") {
                interfaceUsedCounts.set(supplier.id, (interfaceUsedCounts.get(supplier.id) || 0) + 1);
                interfaceUsingComponent.set(supplier.id, edge.client);
            }
        }
    });

    const filteredComponents = umlComponents.filter(comp => {
        if (comp instanceof Interface) {
            const providedCount = interfaceProvidedCounts.get(comp.id) || 0;
            const usedCount = interfaceUsedCounts.get(comp.id) || 0;

            if (providedCount === 1 && usedCount === 1) {
                const providerId = interfaceProvidingComponent.get(comp.id);
                const userId = interfaceUsingComponent.get(comp.id);
                if (providerId && userId) {
                    virtualEdges.push(new Edge(providerId, userId, "virtual:mergedEdge", comp));
                    passThroughInterfaces.add(comp.id);
                    return false;
                }
            } else if ((providedCount === 1 && usedCount === 0) || (providedCount === 0 && usedCount === 1)) {
                singleInterfaces.add(comp.id);
            }
        }
        return true;
    });

    const finalEdges = umlEdges.filter(edge => {
        const supplier = componentMap.get(edge.supplier);
        return !(supplier instanceof Interface && passThroughInterfaces.has(supplier.id));
    }).concat(virtualEdges);

    const passThroughInterfaceMap = new Map<string, Interface>();
    passThroughInterfaces.forEach(id => {
        const iface = componentMap.get(id);
        if (iface instanceof Interface) {
            passThroughInterfaceMap.set(id, iface);
        }
    });

    return {
        processedComponents: filteredComponents,
        processedEdges: finalEdges,
        passThroughInterfaceMap,
        interfaceProvidedCounts,
        interfaceUsedCounts,
        singleInterfaces
    };
}

function useForceLayout(nodes: AbstractComponent[], edges: Edge[]) {
    const [positions, setPositions] = useState<{ [id: string]: { x: number; y: number } }>({});

    useEffect(() => {
        const simNodes = nodes.map(d => ({...d}));
        const simLinks = edges.map(d => ({
            ...d,
            source: d.client,
            target: d.supplier
        }));

        const simulation = d3.forceSimulation(simNodes as any)
            .force('link', d3.forceLink(simLinks)
                .id((d: any) => d.id)
                .distance(200)
                .strength(2))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('collision', d3.forceCollide().radius(() => 120).strength(1.2))
            .force('x', d3.forceX(window.innerWidth / 2).strength(0.05))
            .force('y', d3.forceY(window.innerHeight / 2).strength(0.05))
            .force('center', d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2))
            .on('tick', () => {
                const updated = {} as any;
                simNodes.forEach(node => {
                    updated[node.id] = { x: node.x, y: node.y };
                });
                setPositions(updated);
            });

        // Cleanup simulation on unmount
        return () => {
            simulation.stop();
        };
    }, [nodes, edges]);

    return positions;
}
