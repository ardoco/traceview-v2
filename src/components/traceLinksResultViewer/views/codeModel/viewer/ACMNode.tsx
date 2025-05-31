'use client'

import {HierarchyNode} from "d3";
import {CodeModelUnit} from "@/components/traceLinksResultViewer/views/codeModel/dataModel/ACMDataModel";
import {useHighlightContext} from "@/components/traceLinksResultViewer/views/HighlightContextType";
import {useState} from "react";

type ACMNodeProps = {
    node: HierarchyNode<CodeModelUnit>;
    treeRoot: HierarchyNode<CodeModelUnit>;
    setTreeRoot: (node: HierarchyNode<CodeModelUnit>) => void;
}

export default function ACMNode({node, treeRoot, setTreeRoot}: ACMNodeProps) {
    const {highlightElement, highlightedTraceLinks, highlightingColor} = useHighlightContext();
    const [hovered, setHovered] = useState(false);

    if (highlightedTraceLinks.some(traceLink => traceLink.codeElementId.startsWith(node.data.path!)))
        console.log("success")

    function textSymbol() {
        if (node.children) return <text dy=".3em" textAnchor="middle" fontSize={8} fill="white">−</text>;
        if (node._children) return <text dy=".3em" textAnchor="middle" fontSize={8} fill="white">+</text>;
        return null;
    }

    return (
        <g transform={`translate(${node.y}, ${node.x})`}
           onMouseOver={() => setHovered(true)}
           onMouseOut={() => setHovered(false)}
           onClick={(event) => {
               event.stopPropagation();

               if (event.ctrlKey) {
                   const target = treeRoot.descendants().find(n => n.data.id === node.data.id);
                   if (target) {
                       if (target.children) {
                           target._children = target.children;
                           target.children = null;
                       } else {
                           target.children = target._children;
                           target._children = null;
                       }
                   }

                   // Force re-render by creating a new reference
                   setTreeRoot(Object.assign(Object.create(Object.getPrototypeOf(treeRoot)), treeRoot));
               } else {
                   highlightElement(node.data.path ?? null, "codeElementId");
               }
           }}
        >
            <circle r={highlightedTraceLinks.some(traceLink => traceLink.codeElementId.startsWith(node.data.path!)) ?  6 : 4}
                    fill={ hovered ? "#D3D3D3" : highlightedTraceLinks.some(traceLink => traceLink.codeElementId.startsWith(node.data.path!)) ? highlightingColor : "#999"}
                    strokeWidth={10}/>
            {textSymbol()}
            <text
                dy={"0.34em"}
                x={6}
                textAnchor={"start"}
                strokeLinejoin={"round"}
                paintOrder={"stroke"}
                stroke={highlightedTraceLinks.some(traceLink => traceLink.codeElementId.startsWith(node.data.path!)) ? highlightingColor :'#fff'}
                strokeWidth={2}
                fontSize={8}
            >
                {node.data.name}
            </text>
            <text
                dy={"0.34em"}
                x={6}
                textAnchor={"start"}
                strokeLinejoin={"round"}
                paintOrder={"stroke"}
                strokeWidth={3}
                fontSize={8}
            >
                {node.data.name}
            </text>
        </g>
    );

}