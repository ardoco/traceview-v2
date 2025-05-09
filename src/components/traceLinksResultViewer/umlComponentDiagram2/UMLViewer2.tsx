import React, {useRef, useState, useEffect} from "react";
import {AbstractComponent, Component, Edge} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";
import UMLEdge from "@/components/traceLinksResultViewer/umlComponentDiagram2/UMLEdge";
import UMLNode from "@/components/traceLinksResultViewer/umlComponentDiagram2/UMLComponentNode";
import {forceCenter, forceLink, forceManyBody, forceSimulation, select} from "d3";
import * as d3 from "d3";
import {InterfaceAnchor} from "@/components/traceLinksResultViewer/umlComponentDiagram2/InterfaceAnchor";


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

    const addAnchors = (anchors: InterfaceAnchor[], componentId: string) => {
        setInterfaceAnchors((prev) => {
            const updated = { ...prev, [componentId]: anchors };
            // Check if all anchors are registered
            if (Object.keys(updated).length === umlComponentsFiltered.length) {
                setAnchorsReady(true);
            }
            return updated;
        });
    };

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

        svg.call(
            d3.zoom()
                .on("zoom", (event) => {
                    g.attr("transform", event.transform);
                })
        );
    }, []);


    return (
        <div className={"relative w-full h-full bg-white overflow-auto"}>
        <svg ref={svgRef}  style={{width: "100%", height: "100%"}} viewBox="-500 -500 2000 2000">
            <g ref={zoomRef}>
                {/* Render Edges First */}
                {/*{umlEdges.map((edge, i) => (*/}
                {/*    <UMLEdge*/}
                {/*        key={i}*/}
                {/*        edge={edge}*/}
                {/*        source={{x: positions[edge.source]?.x, y: positions[edge.source]?.y}}*/}
                {/*        target={{x: positions[edge.target]?.x, y: positions[edge.target]?.y}}*/}
                {/*    />*/}
                {/*))}*/}
                {anchorsReady &&
                    processedEdges.map((edge, i) => (
                        <UMLEdge
                            key={i}
                            edge={edge}
                            source={edge.sourcePosition}
                            target={edge.targetPosition}
                        />
                    ))}

                {/* Render Components */}
                {umlComponentsFiltered.map((comp) => (
                    <UMLNode
                        key={comp.id}
                        component={comp}
                        position={{x: positions[comp.id]?.x ?? 0, y: positions[comp.id]?.y ?? 0}}
                        addAnchors={addAnchors}
                        umlComponentsMap={umlComponentsMap}
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


