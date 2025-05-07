import React from 'react';
import {Interface} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";
import UMLOperationView from "@/components/traceLinksResultViewer/graphVisualizations/umlViewer/UMLOperationView";
import {useHighlightContext} from "@/components/traceLinksResultViewer/util/HighlightContextType";

type UMLInterfaceViewProps = {
    umlInterface: Interface,
    position: { x: number, y: number },
}

export default function UMLInterfaceView({umlInterface, position}: UMLInterfaceViewProps) {

    const {highlightElement, highlightedTraceLinks} = useHighlightContext();
    return (
        <div
            className={`absolute bg-white border rounded-lg shadow-md text-sm ${highlightedTraceLinks.some(traceLink => traceLink.modelElementId == umlInterface.id) ? "bg-yellow-300" : "bg-white"}`}
            style={{top: position.y, left: position.x, width: 200}}
            onClick={() => highlightElement(umlInterface.id, "modelElementId")}
        >
            <div className="font-bold text-center border-b p-2 bg-blue-100">{umlInterface.name}</div>
            <div className="p-2">
                {umlInterface.ownedOperations.map((operation, i) => (
                    <UMLOperationView key={operation.id} umlOperation={operation}/>
                ))}
            </div>
        </div>
    )

}