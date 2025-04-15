import { XMLParser, XMLValidator } from 'fast-xml-parser';
import {
    UML2Operation,
    UMLComponent,
    UMLInterface, UMLModel
} from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/UMLDataModel";

export default function parseUML(rawXML: string): any {

    // validate XML
    const result = XMLValidator.validate(rawXML, {
        allowBooleanAttributes: true
    });

    const options = {
        ignoreDeclaration: true,
        ignoreAttributes: false,
        //attributeNamePrefix: "@_"
    };

    const parser = new XMLParser(options);
    const jsonObj = parser.parse(rawXML);
    console.log("jsonObj", jsonObj)

    // parse to UML Data Model
    const components: UMLComponent[] = [];
    const interfaces: UMLInterface[] = [];

    // Tuples replacing Maps
    const interfaceRealizations: [string, string][] = []; // [component_id, interface_id]
    const usages: [string, string][] = []; // [child_id, parent_id]


    const elements = jsonObj['uml:Model']['packagedElement'];

    for (const element of elements) {
        const type = element["@_xmi:type"];
        const id = element["@_xmi:id"];
        const name = element["@_name"] || "Unnamed";

        if (type === "uml:Interface") {
            const operations = element['ownedOperation'] || [];
            const operationsArray = Array.isArray(operations) ? operations : [operations];

            const operationsList = operationsArray.map((operation: any) =>
                new UML2Operation(operation["@_xmi:id"], operation["@_name"] || "Unnamed")
            );
            interfaces.push(new UMLInterface(id, name, operationsList));

        } else if (type === "uml:Component") {
            let umlComponent = new UMLComponent(id, name);
            components.push(umlComponent);

            console.log(element["packagedElement"])

            // If this component has a `packagedElement`, add child components
            if (element["packagedElement"]) {
                const usageOfElement = Array.isArray(element["packagedElement"])
                    ? element["packagedElement"]
                    : [element["packagedElement"]];

                console.log("after", element["packagedElement"])

                for (const usage of usageOfElement) {
                    console.log("usage", usage)
                    usages.push([usage["@_client"], usage["@_supplier"]]); // Store the child-parent relationship
                }
            }

            // Handle interface realizations (meaning this component implements an interface)
            if (element["interfaceRealization"]) {
                const interfaceRealization = Array.isArray(element["interfaceRealization"])
                    ? element["interfaceRealization"]
                    : [element["interfaceRealization"]];
                for (const realization of interfaceRealization) {
                    interfaceRealizations.push([realization["@_client"], realization["@_supplier"]]); // Store the component-interface relationship
                }
            }
        }
    }


    // Handle interface realizations
    console.log("interfaceRealizations", interfaceRealizations);
    for (const [componentId, interfaceId] of interfaceRealizations) {
        const component = components.find((comp) => comp.getIdentifier() === componentId);
        const implementedInterface = interfaces.find((iface) => iface.getIdentifier() === interfaceId);
        if (component && implementedInterface) {
            component.addExtends(implementedInterface);
            implementedInterface.addChild(component);
        } else {
            console.error(`Component with ID ${componentId} or Interface with ID ${interfaceId} not found.`);
        }
    }

    // handle usages
    console.log("usages", usages)
    for (const [childId, parentId] of usages) {
        const childComponent = components.find((comp) => comp.getIdentifier() === childId);
        const parentComponent = interfaces.find((comp) => comp.getIdentifier() === parentId);
        if (childComponent && parentComponent) {
            childComponent.addUses(parentComponent);
        } else {
            console.error(`Component with ID ${childId} or ${parentId} not found.`);
        }
    }

    console.log("interfaces", interfaces);
    console.log("components", components);


    const umlModel = new UMLModel(components, interfaces);
    return umlModel;


}
