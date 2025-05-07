import {Attribute} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";

type UMLAttributeViewProps = {
    umlAttribute: Attribute;
}

export default function UMLAttributeView({umlAttribute}: UMLAttributeViewProps) {
    return (
        <div className="text-gray-700">{umlAttribute.name}</div>
    );

}