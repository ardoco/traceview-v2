import React from 'react';
import {Component} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";
import UMLAttributeView from "@/components/traceLinksResultViewer/graphVisualizations/umlViewer/UMLAttributeView";
import UMLOperationView from "@/components/traceLinksResultViewer/graphVisualizations/umlViewer/UMLOperationView";
import {useHighlightContext} from "@/components/traceLinksResultViewer/util/HighlightContextType";

type UMLComponentViewProps = {
    umlComponent: Component,
    position: { x: number, y: number },
}

export default function UMLComponentView({umlComponent, position}: UMLComponentViewProps) {

    const {highlightElement, highlightedTraceLinks} = useHighlightContext();

    return (
        <div
            className={`absolute border rounded-lg shadow-md text-sm ${highlightedTraceLinks.some(traceLink => traceLink.modelElementId == umlComponent.id) ? "bg-yellow-300" : "bg-white"}`}
            style={{top: position.y, left: position.x, width: 200}}
            onClick={() => highlightElement(umlComponent.id, "modelElementId")}
        >
            <div className="font-bold text-center border-b p-2 bg-blue-100">&laquo;component&raquo; {umlComponent.name}</div>
            <div className="border-b p-2">
                {umlComponent.attributes.map((attribute, i) => (
                    <UMLAttributeView key={attribute.id} umlAttribute={attribute}/>
                ))}
            </div>
            <div className="p-2">
                {umlComponent.operations.map((operation, i) => (
                    <UMLOperationView key={operation.id} umlOperation={operation}/>
                ))}
            </div>
        </div>
    )

}