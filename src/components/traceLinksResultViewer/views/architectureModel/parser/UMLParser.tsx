import {XMLParser} from 'fast-xml-parser';
import {
    AbstractComponent,
    Attribute,
    Component,
    Edge,
    Interface,
    Operation,
    Package,
    UMLClass
} from "@/components/traceLinksResultViewer/views/architectureModel/dataModel/ArchitectureDataModel";

/**
 * A parsed XML element. The shape depends on the element, so values are narrowed by the helpers below.
 */
type XmlElement = { [key: string]: unknown };

/** Reads an attribute (or text value) of an XML element. */
function str(element: XmlElement, key: string): string {
    return element[key] as string;
}

/** Reads the child elements stored under a key, which fast-xml-parser returns as a single object or an array. */
function children(element: XmlElement, key: string): XmlElement[] {
    const value = element[key];
    return (Array.isArray(value) ? value : [value]) as XmlElement[];
}

export interface EdgeTypes {
    usages: Edge[];
    providedInterfaces: Edge[];
}

function removeDuplicatesWithEquals<T extends AbstractComponent>(items: T[]): T[] {
    const result: T[] = [];

    for (const item of items) {
        if (!result.some(existing => existing.equals(item))) {
            result.push(item);
        }
    }

    return result;
}

export default function parseUMLModel(rawXML: string): { components: AbstractComponent[]; edges: Edge[] } {
    const options = {
        ignoreDeclaration: true,
        ignoreAttributes: false,
        attributeNamePrefix: "@_"
    };

    const parser = new XMLParser(options);
    const jsonModel = parser.parse(rawXML);

    let components: AbstractComponent[] = [];
    const edges: Edge[] = [];

    const elements = jsonModel["uml:Model"]["packagedElement"] as XmlElement[] | undefined;
    if (!elements) return {components, edges};

    for (const element of elements) {
        const packagedElements = extractPackagedElement(element, edges);
        components.push(...packagedElements);
    }

    // add used Interface
    for (const edge of edges) {
        if (edge.type == "uml:InterfaceRealization" || edge.type == "uml:Usage") {
            const supplierComponent = components.find(comp => comp.id == edge.supplier);
            if (supplierComponent && supplierComponent instanceof Interface) {
                edge.usedInterface = supplierComponent;
            }
        }
    }

    components = removeDuplicatesWithEquals(components);

    return {components, edges};
}

function extractPackagedElement(element: XmlElement, edges: Edge[]): AbstractComponent[] {
    const type = str(element, "@_xmi:type");

    const addedEdges: EdgeTypes = addEdges(element, edges);

    // Process element based on its type
    switch (type) {
        case "uml:Class":
            return [
                new UMLClass(
                    str(element, "@_xmi:id"),
                    str(element, "@_name"),
                    extractAttributes(element),
                    extractOperations(element)
                )];

        case "uml:Component":
            return [
                new Component(
                    str(element, "@_xmi:id"),
                    str(element, "@_name"),
                    extractAttributes(element),
                    extractOperations(element),
                    addedEdges.usages.map((usage) => usage.supplier),
                    addedEdges.providedInterfaces.map((providedInterface) => providedInterface.supplier)
                )];

        case "uml:Interface":
            return [
                new Interface(
                    str(element, "@_xmi:id"),
                    str(element, "@_name"),
                    extractOperations(element)
                )];

        case "uml:Package":
            const components = children(element, "packagedElement");
            // Recursively extract components from the package
            const packagedElements: AbstractComponent[] = [];
            components
                .filter((el) => el["@_xmi:type"] !== "uml:Usage")
                .map((el) => extractPackagedElement(el, edges))
                .forEach((el) => packagedElements.push(...el));

            return [
                new Package(
                    str(element, "@_xmi:id"),
                    str(element, "@_name"),
                    packagedElements
                )];


        default:
            console.warn(`Unhandled element type: ${type}`);
            break;


    }
    return [];
}

function addEdges(element: XmlElement, edges: Edge[]): EdgeTypes {
    const usages = extractUsage(element);
    const providedInterfaces = extractInterfaceRealizations(element);

    edges.push(...extractGeneralizations(element));
    edges.push(...providedInterfaces);
    edges.push(...usages);

    return {usages: usages, providedInterfaces: providedInterfaces} as EdgeTypes;
}

function extractOperations(element: XmlElement): Operation[] {
    let operations: Operation[] = [];
    if (element["ownedOperation"]) {
        const ops = children(element, "ownedOperation");
        operations = ops.map((operation) =>
            new Operation(str(operation, "@_xmi:id"), str(operation, "@_name") || "Unnamed")
        );
    }
    return operations;
}


function extractAttributes(element: XmlElement): Attribute[] {
    let attributes: Attribute[] = [];
    if (element["ownedAttribute"]) {
        const attrs = children(element, "ownedAttribute");
        attributes = attrs.map((attr) =>
            new Attribute(
                str(attr, "@_xmi:id"),
                str(attr, "@_name") || "Unnamed",
                str(attr, "@_type") || "Unknown"
            )
        );
    }
    return attributes;
}


function extractGeneralizations(element: XmlElement): Edge[] {
    let generalizations: Edge[] = [];
    if (element["generalization"]) {
        const gens = children(element, "generalization");
        generalizations = gens.map((gen) =>
            new Edge(
                str(element, "@_xmi:id"), // specification: e.g. Elephant
                str(gen, "general"), // generalization: e.g. Mammal
                "uml:Generalization"
            )
        );
    }
    return generalizations;
}

function extractInterfaceRealizations(element: XmlElement): Edge[] {
    let interfaceRealizations: Edge[] = [];
    if (element["interfaceRealization"]) {
        const irs = children(element, "interfaceRealization");


        interfaceRealizations = irs.map((interfaceRealization) =>
            new Edge(
                str(interfaceRealization, "@_client"), // client realizes supplied interface
                str(interfaceRealization, "@_supplier"), // id of the supplied interface
                "uml:InterfaceRealization"
            )
        );
    }
    return interfaceRealizations;
}

function extractUsage(element: XmlElement): Edge[] {
    let usages: Edge[] = [];
    if (element["packagedElement"]) {
        const usagesArray = children(element, "packagedElement");
        usages = usagesArray
            .filter((el) => el["@_xmi:type"] === "uml:Usage")
            .map((usage) =>
                new Edge(
                    str(usage, "@_client"), // element that uses the target component
                    str(usage, "@_supplier"), // id of the component that is being used
                    "uml:Usage" // type of the edge
                )
            );
    }
    return usages;
}
