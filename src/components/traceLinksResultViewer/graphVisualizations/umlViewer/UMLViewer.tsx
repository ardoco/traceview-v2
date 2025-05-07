import {
    AbstractComponent,
    Component,
    Edge,
    Interface,
    UMLClass
} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";
import UMLClassView from "@/components/traceLinksResultViewer/graphVisualizations/umlViewer/UMLClassView";
import {useEffect, useState} from "react";
import {forceCenter, forceLink, forceManyBody, forceSimulation} from "d3";
import UMLInterfaceView from "@/components/traceLinksResultViewer/graphVisualizations/umlViewer/UMLInterfaceView";
import UMLComponentView from "@/components/traceLinksResultViewer/graphVisualizations/umlViewer/UMLComponentView";
import * as d3 from "d3";
import UMLRelationshipView from "@/components/traceLinksResultViewer/graphVisualizations/umlViewer/UMLRelationshipView";

type UMLViewerProps = {
    umlComponents: AbstractComponent[];
    umlEdges: Edge[];
}

export default function UMLViewer({umlComponents, umlEdges}: UMLViewerProps) {
    const positions = useForceLayout(umlComponents, umlEdges);
    return (
        <div className="relative w-full h-full bg-gray-100 overflow-auto">
            {umlEdges.map((edge, index) => <UMLRelationshipView from={positions[edge.source]}
                                                                to={positions[edge.target]} type={edge.type} key={index}/>)}
            {umlComponents.map((component, index) => {
                switch (component.type) {
                    case "uml:Class":
                        return <UMLClassView umlClass={(component as UMLClass)}
                                             position={{
                                                 x: positions[component.id]?.x ?? 0,
                                                 y: positions[component.id]?.y ?? 0
                                             }} key={index}/>;
                    case "uml:Interface":
                        return <UMLInterfaceView umlInterface={(component as Interface)}
                                                 position={{
                                                     x: positions[component.id]?.x ?? 0,
                                                     y: positions[component.id]?.y ?? 0
                                                 }} key={index}/>;
                    case "uml:Component":
                        return <UMLComponentView umlComponent={(component as Component)}
                                                 position={{
                                                     x: positions[component.id]?.x ?? 0,
                                                     y: positions[component.id]?.y ?? 0
                                                 }} key={index}/>;
                    default:
                        return null;
                }
            })}
        </div>
    );
}

const useForceLayout = (nodes: AbstractComponent[], edges: Edge[]) => {
    const [positions, setPositions] = useState<{ [id: string]: { x: number; y: number } }>({});

    useEffect(() => {
        const simNodes = nodes.map(d => ({...d}));
        const simLinks = edges.map(d => ({...d}));

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

