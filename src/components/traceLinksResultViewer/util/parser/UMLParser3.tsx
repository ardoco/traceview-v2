import { XMLParser, XMLValidator } from 'fast-xml-parser';
import * as d3 from "d3";

export class Operation {
    constructor(
        public id: string,
        public name: string
    ) {}
}

export class Attribute {
    constructor(
        public id: string,
        public name: string,
        public type: string // e.g. "String", "int"
    ) {}
}

export class AbstractComponent {
    constructor(
        public id: string,
        public name: string,
        public type: string, // "uml:Component" | "uml:Interface" | "uml:Class" | ...
        public x?: number,
        public y?: number
    ) {}
}

export class Package extends AbstractComponent {
    public components: AbstractComponent[] = [];
    constructor(id: string, name: string, components: AbstractComponent[]) {
        super(id, name, "uml:Package");
        this.components = components;
    }
}

export class Interface extends AbstractComponent {
    public ownedOperations: Operation[] = [];
    constructor(id: string, name: string, operations: Operation[]) {
        super(id, name, "uml:Interface");
        this.ownedOperations = operations;
    }
}

export class UMLClass extends AbstractComponent {
    public attributes: Attribute[] = [];
    public operations: Operation[] = [];
    constructor(id: string, name: string, attributes: Attribute[], operations: Operation[]) {
        super(id, name, "uml:Class");
        this.attributes = attributes;
        this.operations = operations;
    }
}

export class Component extends AbstractComponent {
    public attributes: Attribute[] = [];
    public operations: Operation[] = [];
    constructor(id: string, name: string, attributes: Attribute[], operations: Operation[]) {
        super(id, name, "uml:Component");
        this.attributes = attributes;
        this.operations = operations;
    }
}

export class Edge {
    constructor(
        public source: string,
        public target: string,
        public type: string, // "uml:Generalization" | "uml:InterfaceRealization" | "uml:Usage" | ...
        public label?: string
    ) {}
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

    return { components, edges };
}

function extractPackagedElement(element: any, edges:Edge[]): AbstractComponent[] {
    const type = element["@_xmi:type"];

    addEdges(element, edges);

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
                    extractOperations(element)
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

function addEdges(element: any, edges:Edge[]) {
    edges.push(...extractGeneralizations(element));
    edges.push(...extractInterfaceRealizations(element));
    edges.push(...extractUsage(element));
}

function extractOperations(element: any): Operation[] {
    let operations: Operation[] = [];
    if (element["ownedOperation"]) {
        const ops = Array.isArray(element["ownedOperation"]) ? element["ownedOperation"] : [element["ownedOperation"]];
        operations = ops.map((operation: any) => ({
            id: operation["@_xmi:id"],
            name: operation["@_name"],
        }));
    }
    return operations;
}


function extractAttributes(element: any): Attribute[] {
    let attributes: Attribute[] = [];
    if (element["ownedAttribute"]) {
        const attrs = Array.isArray(element["ownedAttribute"]) ? element["ownedAttribute"] : [element["ownedAttribute"]];
        attributes = attrs.map((attr: any) => ({
            id: attr["@_xmi:id"],
            name: attr["@_name"],
            type: attr["@_type"] ? attr["@_type"]["@_href"] || attr["@_type"]["@_xmi:idref"] : "Unknown",
        }));
    }
    return attributes;
}


function extractGeneralizations(element: any): Edge[] {
    let generalizations: Edge[] = [];
    if (element["generalization"]) {
        const gens = Array.isArray(element["generalization"]) ? element["generalization"] : [element["generalization"]];
        generalizations = gens.map((gen: any) => ({
            source: element["@_xmi:id"], // specification: e.g. Elephant
            target: gen["general"], // generalization: e.g. Mammal
            type: "uml:Generalization",
        }));
    }
    return generalizations;
}

function extractInterfaceRealizations(element: any): Edge[] {
    let interfaceRealizations: Edge[] = [];
    if (element["interfaceRealization"]) {
        const irs = Array.isArray(element["interfaceRealization"]) ? element["interfaceRealization"] : [element["interfaceRealization"]];
        interfaceRealizations = irs.map((interfaceRealization: any) => ({
            source: interfaceRealization["@_client"], // client realizes supplied interface
            target: interfaceRealization["@_supplier"], // id of the supplied interface
            type: "uml:InterfaceRealization",
        }));
    }
    return interfaceRealizations;
}

function extractUsage(element: any): Edge[] {
    let usages: Edge[] = [];
    if (element["packagedElement"]) {
        const usagesArray = Array.isArray(element["packagedElement"]) ? element["packagedElement"] : [element["packagedElement"]];
        usages = usagesArray
            .filter((el: any) => el["@_xmi:type"] === "uml:Usage")
            .map((usage: any) => ({
                source: usage["@_client"], // element that uses the target component
                target: usage["@_supplier"], // id of the component that is being used
                type: "uml:Usage",
            }));
    }
    return usages;
}






























// interface Operation { // models xmi:type=uml:Operation
//     name: string;
//     returnType?: string;
//     parameters?: Attribute[];
// }
//
//
//
// interface Node extends d3.SimulationNodeDatum {
//     id: string;
//     name: string;
//     type: string; // "Component" | "Interface" | "Class" | "Package" | ...
//     attributes?: Attribute[];
//     operations?: Operation[];
//     children?:Node[];
// }
//
// interface Edge extends d3.SimulationLinkDatum<Node>{
//     source: string;
//     target: string;
//     label?: string
//     type: string;
// }
//
// interface Attribute {
//     name: string;
//     type: string;
// }
//
//
//
// export default function parseUML(rawXML: string): any {
//
//     const options = {
//         ignoreDeclaration: true,
//         ignoreAttributes: false,
//         //attributeNamePrefix: "@_"
//     };
//
//     const parser = new XMLParser(options);
//     const jsonModel = parser.parse(rawXML);
//
//     let nodes:Node[] = [];
//     let edges:Edge[] = [];
//
//     let elements = jsonModel["uml:Model"]["packagedElement"];
//     if (!elements) return { nodes, edges };
//
//     elements.forEach((element: any) => extractNestedElements(element, nodes, edges));
//
//     return { nodes, edges };
//
// }
//
// function extractNestedElements(parent:any, nodes:Node[], edges:Edge[]) {
//     if (!parent) return;
//
//     // // If the element has an ID, it's a node
//     // if (parent["@_xmi:id"] && parent["@_xmi:type"]) {
//     //     nodes.push({
//     //         id: parent["@_xmi:id"],
//     //         name: parent["@_name"] || "Unnamed",
//     //         type: parent["@_xmi:type"].replace("uml:", ""),
//     //     });
//     // }
//     extractNodes(nodes, edges, parent);
//
//     // If the element has relationships, add edges
//     if (parent["@_client"] && parent["@_supplier"]) {
//         edges.push({
//             source: parent["@_client"],
//             target: parent["@_supplier"],
//             type: parent["@_xmi:type"].replace("uml:", ""),
//             label: parent["@_name"] || ""
//         });
//     }
//
//     // Recurse through child elements
//     for (let key in parent) {
//         if (Array.isArray(parent[key])) {
//             parent[key].filter((element) =>
//                 element["@_xmi:type"] != "uml:ownedAttribute" ||
//                 element["@_xmi:type"] != "uml:ownedOperation" ||
//                 element["@_xmi:type"] != "uml:Usage" ||
//                 element["@_xmi:type"] != "uml:InterfaceRealization" ||
//                 element["@_xmi:type"] != "uml:Generalization")
//
//                 .forEach(child => extractNestedElements(child, nodes, edges));
//         } else if (typeof parent[key] === "object") {
//             extractNestedElements(parent[key], nodes, edges);
//         }
//     }
// }
//
//
// function extractNodes(nodes:Node[], edges: Edge[], currentNode:any) {
//
//     if (currentNode["@_xmi:type"] && currentNode["@_xmi:id"]) {
//         let attributes:Attribute[] = [];
//         let operations:Operation[] = [];
//
//         // Extract attributes from ownedAttribute
//         if (currentNode["ownedAttribute"]) {
//             let attrs = Array.isArray(currentNode["ownedAttribute"]) ? currentNode["ownedAttribute"] : [currentNode["ownedAttribute"]];
//             attributes = attrs.map(attr => ({
//                 name: attr["@_name"],
//                 type: attr["type"] ? attr["type"]["@_href"] || attr["type"]["@_xmi:idref"] : "Unknown"
//             }));
//         }
//
//         // Extract operations from ownedOperation
//         if (currentNode["ownedOperation"]) {
//             let ops = Array.isArray(currentNode["ownedOperation"]) ? currentNode["ownedOperation"] : [currentNode["ownedOperation"]];
//             operations = ops.map(op => ({
//                 name: op["@_name"]
//             }));
//         }
//
//         nodes.push({
//             id: currentNode["@_xmi:id"],
//             name: currentNode["@_name"] || "Unnamed",
//             type: currentNode["@_xmi:type"].replace("uml:", ""),
//             attributes: attributes,
//             operations: operations
//         });
//
//         // Add edges
//         if (currentNode["interfaceRealization"]) {
//             let realizations = Array.isArray(currentNode["interfaceRealization"]) ? currentNode["interfaceRealization"] : [currentNode["interfaceRealization"]];
//             realizations.forEach(realization => {
//                 edges.push({
//                     source: realization["@_client"], // client realizes supplied inter
//                     target:realization["@_supplier"],
//                     type: "uml:InterfaceRealization",
//                 });
//             });
//         }
//
//         if (currentNode["packagedElement"]) {
//             let elements = Array.isArray(currentNode["packagedElement"]) ? currentNode["packagedElement"] : [currentNode["packagedElement"]];
//             elements
//                 .filter((element) => element["@_xmi:type"] == "uml:Usage")
//                 .forEach(element => {
//                     edges.push({
//                         source: element["@_client"],
//                         target: element["@_supplier"],
//                         type: element["@_xmi:type"].replace("uml:", ""),
//                     });
//                 })
//         }
//
//         if (currentNode["generalization"]) {
//             let generalizations = Array.isArray(currentNode["generalization"]) ? currentNode["generalization"] : [currentNode["generalization"]];
//             generalizations.forEach(generalization => {
//                 edges.push({
//                     source: generalization["@_xmi:id"],
//                     target: generalization["general"]["@_xmi:idref"],
//                     type: "Generalization"
//                 });
//             });
//         }
//     }
//
//     return nodes;
// }
