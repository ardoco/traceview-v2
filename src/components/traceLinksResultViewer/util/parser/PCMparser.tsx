import { XMLParser, XMLValidator } from 'fast-xml-parser';
import {
    AbstractComponent,
    Component,
    Edge,
    Interface
} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";

export function parsePCM(xmlString: string): { components: AbstractComponent[]; edges: Edge[] } {
    const parser = new XMLParser(
        { ignoreAttributes: false,
            attributeNamePrefix: '' }
    );

    const jsonObj = parser.parse(xmlString);

    const repo = jsonObj['repository:Repository'];

    const rawComponents = Array.isArray(repo.components__Repository)
        ? repo.components__Repository
        : [repo.components__Repository];

    const rawInterfaces = Array.isArray(repo.interfaces__Repository)
        ? repo.interfaces__Repository
        : [repo.interfaces__Repository];

    const interfaceMap = new Map<string, Interface>();
    const components: AbstractComponent[] = [];
    const edges: Edge[] = [];

    // Step 1: Build Interfaces
    for (const iface of rawInterfaces) {
        const id = iface.id;
        const name = iface.entityName;
        interfaceMap.set(id, new Interface(id, name, []));
    }

    // Step 2: Build Components and Edges
    for (const comp of rawComponents) {
        const id = comp.id;
        const name = comp.entityName;
        const type = comp.componentType ? `uml:Component` : `uml:Component`;

        const provided = comp.providedRoles_InterfaceProvidingEntity
            ? Array.isArray(comp.providedRoles_InterfaceProvidingEntity)
                ? comp.providedRoles_InterfaceProvidingEntity
                : [comp.providedRoles_InterfaceProvidingEntity]
            : [];

        const required = comp.requiredRoles_InterfaceRequiringEntity
            ? Array.isArray(comp.requiredRoles_InterfaceRequiringEntity)
                ? comp.requiredRoles_InterfaceRequiringEntity
                : [comp.requiredRoles_InterfaceRequiringEntity]
            : [];

        const providedInterfaces = provided.map(p => p.providedInterface__OperationProvidedRole);
        const usages = required.map(r => r.requiredInterface__OperationRequiredRole);

        const component = new Component(id, name, [], [], usages, providedInterfaces);
        components.push(component);

        // Add provided interface edges
        for (const p of provided) {
            const ifaceId = p.providedInterface__OperationProvidedRole;
            if (interfaceMap.has(ifaceId)) {
                edges.push(
                    new Edge(id, ifaceId, "uml:InterfaceRealization", interfaceMap.get(ifaceId))
                );
            }
        }

        // Add required interface edges
        for (const r of required) {
            const ifaceId = r.requiredInterface__OperationRequiredRole;
            if (interfaceMap.has(ifaceId)) {
                edges.push(
                    new Edge(id, ifaceId, "uml:Usage", interfaceMap.get(ifaceId))
                );
            }
        }
    }

    // Step 3: Add interfaces to components list
    for (const iface of interfaceMap.values()) {
        components.push(iface);
    }

    return { components, edges };
}