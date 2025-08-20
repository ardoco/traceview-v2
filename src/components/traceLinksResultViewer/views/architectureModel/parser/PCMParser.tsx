import {XMLParser} from 'fast-xml-parser';
import {
    AbstractComponent,
    Component,
    Edge,
    Interface
} from "@/components/traceLinksResultViewer/views/architectureModel/dataModel/ArchitectureDataModel";

/**
 * Ensures a given item is always returned as an array.
 * If the item is already an array, it's returned as is.
 * If it's a single non-null value, it's wrapped in an array.
 * If it's null or undefined, an empty array is returned.
 *
 * @param item The item to convert to an array.
 * @returns An array representation of the item.
 */
function toArray<T>(item: T | T[] | null | undefined): T[] {
    if (Array.isArray(item)) {
        return item;
    }
    if (item !== null && item !== undefined) {
        return [item];
    }
    return [];
}

/**
 * Parses a PCM (Palladio Component Model) XML string into a structured
 * representation of components and their relationships (edges and interfaces).
 *
 * This function extracts components, interfaces, and their provided/required
 * roles from the XML, converting them into `AbstractComponent` (specifically `Component` and `Interface`)
 * and `Edge` objects.
 *
 * @param xmlString The XML content representing the PCM model.
 * @returns An object containing two arrays: `components` (all parsed `Component` and `Interface` objects)
 * and `edges` (all parsed `Edge` objects representing relationships like InterfaceRealization and Usage).
 * @throws {Error} If the XML parsing fails or the expected root structure is not found.
 */
export function parsePCM(xmlString: string): { components: AbstractComponent[]; edges: Edge[] } {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '' // Preserve attribute names as they are (e.g., 'id', 'entityName')
    });

    let jsonObj: any;
    try {
        jsonObj = parser.parse(xmlString);
    } catch (error) {
        console.error("Failed to parse XML string:", error);
        throw new Error("Invalid XML format. Please check the input XML string.");
    }

    const repository = jsonObj['repository:Repository'];
    if (!repository) {
        throw new Error("Invalid PCM XML structure: 'repository:Repository' element not found.");
    }

    const rawComponents = toArray(repository.components__Repository);
    const rawInterfaces = toArray(repository.interfaces__Repository);

    const interfaceMap = new Map<string, Interface>();
    const components: AbstractComponent[] = [];
    const edges: Edge[] = [];

    // --- Step 1: Build Interface objects and populate the interfaceMap ---
    // This pass ensures all interfaces are available for lookup before processing components.
    for (const rawIface of rawInterfaces) {
        const id = rawIface.id;
        const name = rawIface.entityName;
        if (id && name) {
            interfaceMap.set(id, new Interface(id, name, []));
        } else {
            console.warn(`Skipping interface due to missing ID or name: ${JSON.stringify(rawIface)}`);
        }
    }

    // --- Step 2: Build Component objects and their associated Edges ---
    for (const rawComp of rawComponents) {
        const componentId = rawComp.id;
        const componentName = rawComp.entityName;

        if (!componentId || !componentName) {
            console.warn(`Skipping component due to missing ID or name: ${JSON.stringify(rawComp)}`);
            continue;
        }

        const providedRoles = toArray(rawComp.providedRoles_InterfaceProvidingEntity);
        const requiredRoles = toArray(rawComp.requiredRoles_InterfaceRequiringEntity);

        // Extract interface IDs for the Component constructor
        const providedInterfaceIds = providedRoles.map(p => p.providedInterface__OperationProvidedRole).filter(Boolean);
        const usedInterfaceIds = requiredRoles.map(r => r.requiredInterface__OperationRequiredRole).filter(Boolean);

        const component = new Component(
            componentId,
            componentName,
            [], // attributes (not parsed in this PCM structure)
            [], // operations (not parsed in this PCM structure)
            usedInterfaceIds,
            providedInterfaceIds
        );
        components.push(component);

        // Create edges for provided interfaces (InterfaceRealization)
        for (const pRole of providedRoles) {
            const interfaceId = pRole.providedInterface__OperationProvidedRole;
            const linkedInterface = interfaceMap.get(interfaceId);
            if (linkedInterface) {
                edges.push(
                    new Edge(componentId, interfaceId, "uml:InterfaceRealization", linkedInterface)
                );
            } else {
                console.warn(`Provided interface ID "${interfaceId}" for component "${componentName}" not found in map.`);
            }
        }

        // Create edges for required interfaces (Usage)
        for (const rRole of requiredRoles) {
            const interfaceId = rRole.requiredInterface__OperationRequiredRole;
            const linkedInterface = interfaceMap.get(interfaceId);
            if (linkedInterface) {
                edges.push(
                    new Edge(componentId, interfaceId, "uml:Usage", linkedInterface)
                );
            } else {
                console.warn(`Required interface ID "${interfaceId}" for component "${componentName}" not found in map.`);
            }
        }
    }

    // --- Step 3: Add all parsed Interface objects to the components list ---
    // This makes them available for rendering alongside components in the diagram.
    for (const iface of interfaceMap.values()) {
        components.push(iface);
    }

    return {components, edges};
}