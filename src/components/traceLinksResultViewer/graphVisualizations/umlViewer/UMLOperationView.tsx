import {Operation} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";

type UMLOperationViewProps = {
    umlOperation: Operation;
}

export default function UMLOperationView({umlOperation}: UMLOperationViewProps) {
    return (
        <div className="text-gray-900">{umlOperation.name}()</div>
    );

}