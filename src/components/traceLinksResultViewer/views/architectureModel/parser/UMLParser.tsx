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

    let components:AbstractComponent[] = [];
    let edges:Edge[] = [];

    let elements = jsonModel["uml:Model"]["packagedElement"];
    if (!elements) return { components, edges };

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

    console.log(edges)

    // remove duplicates
    components = removeDuplicatesWithEquals(components);

    // // remove duplicate edges
    // edges = edges.filter((edge, index, self) =>
    //     index === self.findIndex((e) => e.equals(edge)) // Check if the edge is the first occurrence
    // );

    return { components, edges };
}

function getTransitiveEdges(edges:Edge[], components:AbstractComponent[]): Edge[] {

    const usages: Edge[] = edges.filter((edge) => edge.type === "uml:Usage");
    const providedInterfaces: Edge[] = edges.filter((edge) => edge.type === "uml:InterfaceRealization");
    const otherEdges: Edge[] = edges.filter((edge) => edge.type !== "uml:Usage" && edge.type !== "uml:InterfaceRealization");
    const umlComponentsMap = new Map<string, AbstractComponent>();
    components.forEach((comp) => {
        umlComponentsMap.set(comp.id, comp);
    });

    const final: Edge[] = otherEdges;
    providedInterfaces.forEach((providedHalfEdge => {
        usages.forEach((usageHalfEdge => {
            if (providedHalfEdge.supplier === usageHalfEdge.supplier && umlComponentsMap.get(usageHalfEdge.supplier)?.type === "uml:Interface") {
                final.push(new Edge(usageHalfEdge.client, providedHalfEdge.client, usageHalfEdge.type, umlComponentsMap.get(usageHalfEdge.supplier) as Interface));
            }
        }))
    }))
    return final;
}

function extractPackagedElement(element: any, edges:Edge[]): AbstractComponent[] {
    const type = element["@_xmi:type"];

    const addedEdges:EdgeTypes = addEdges(element, edges);

    // Process element based on its type
    switch (type) {
        case "uml:Class":
            return [
                new UMLClass(
                    element["@_xmi:id"],
                    element["@_name"],
                    extractAttributes(element),
                    extractOperations(element)
                )];

        case "uml:Component":
            return [
                new Component(
                    element["@_xmi:id"],
                    element["@_name"],
                    extractAttributes(element),
                    extractOperations(element),
                    addedEdges.usages.map((usage) => usage.supplier),
                    addedEdges.providedInterfaces.map((providedInterface) => providedInterface.supplier)
                )];

        case "uml:Interface":
            return [
                new Interface(
                    element["@_xmi:id"],
                    element["@_name"],
                    extractOperations(element)
                )];

        case "uml:Package":
            const components = Array.isArray(element["packagedElement"]) ? element["packagedElement"] : [element["packagedElement"]];
            // Recursively extract components from the package
            let packagedElements: AbstractComponent[] = [];
            components
                .filter((el: any) => el["@_xmi:type"] !== "uml:Usage")
                .map((el: any) => extractPackagedElement(el, edges))
                .forEach((el: any) => packagedElements.push(...el));

            return [
                new Package(
                    element["@_xmi:id"],
                    element["@_name"],
                    packagedElements
                )];


        default:
            console.warn(`Unhandled element type: ${type}`);
            break;


    }
    return [];
}

function addEdges(element: any, edges:Edge[]): EdgeTypes {
    const usages = extractUsage(element);
    const providedInterfaces = extractInterfaceRealizations(element);

    edges.push(...extractGeneralizations(element));
    edges.push(...providedInterfaces);
    edges.push(...usages);

    return {usages:usages, providedInterfaces:providedInterfaces} as EdgeTypes;
}

function extractOperations(element: any): Operation[] {
    let operations: Operation[] = [];
    if (element["ownedOperation"]) {
        const ops = Array.isArray(element["ownedOperation"]) ? element["ownedOperation"] : [element["ownedOperation"]];
        operations = ops.map((operation: any) =>
            new Operation(operation["@_xmi:id"], operation["@_name"] || "Unnamed")
        );
    }
    return operations;
}


function extractAttributes(element: any): Attribute[] {
    let attributes: Attribute[] = [];
    if (element["ownedAttribute"]) {
        const attrs = Array.isArray(element["ownedAttribute"]) ? element["ownedAttribute"] : [element["ownedAttribute"]];
        attributes = attrs.map((attr: any) =>
            new Attribute(
                attr["@_xmi:id"],
                attr["@_name"] || "Unnamed",
                attr["@_type"] || "Unknown"
            )
        );
    }
    return attributes;
}


function extractGeneralizations(element: any): Edge[] {
    let generalizations: Edge[] = [];
    if (element["generalization"]) {
        const gens = Array.isArray(element["generalization"]) ? element["generalization"] : [element["generalization"]];
        generalizations = gens.map((gen: any) =>
            new Edge(
                element["@_xmi:id"], // specification: e.g. Elephant
                gen["general"], // generalization: e.g. Mammal
                "uml:Generalization"
            )
        );
    }
    return generalizations;
}

function extractInterfaceRealizations(element: any): Edge[] {
    let interfaceRealizations: Edge[] = [];
    if (element["interfaceRealization"]) {
        const irs = Array.isArray(element["interfaceRealization"]) ? element["interfaceRealization"] : [element["interfaceRealization"]];


        interfaceRealizations = irs.map((interfaceRealization: any) =>
            new Edge(
                interfaceRealization["@_client"], // client realizes supplied interface
                interfaceRealization["@_supplier"], // id of the supplied interface
                "uml:InterfaceRealization"
            )
        );
    }
    return interfaceRealizations;
}

function extractUsage(element: any): Edge[] {
    let usages: Edge[] = [];
    if (element["packagedElement"]) {
        const usagesArray = Array.isArray(element["packagedElement"]) ? element["packagedElement"] : [element["packagedElement"]];
        usages = usagesArray
            .filter((el: any) => el["@_xmi:type"] === "uml:Usage")
            .map((usage: any) =>
                new Edge(
                usage["@_client"], // element that uses the target component
                usage["@_supplier"], // id of the component that is being used
                "uml:Usage" // type of the edge
                )
            );
    }
    return usages;
}
