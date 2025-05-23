export class Operation {
    constructor(
        public id: string,
        public name: string
    ) {
    }

    equals(other: Operation): boolean {
        return (
            this.id === other.id &&
            this.name === other.name
        );
    }
}

export class Attribute {
    constructor(
        public id: string,
        public name: string,
        public type: string // e.g. "String", "int"
    ) {
    }

    equals(other: Attribute): boolean {
        return (
            this.id === other.id &&
            this.name === other.name &&
            this.type === other.type
        );
    }
}

export abstract class AbstractComponent {
    constructor(
        public id: string,
        public name: string,
        public type: string, // "uml:Component" | "uml:Interface" | "uml:Class" | ...
        public x?: number,
        public y?: number
    ) {
    }

    abstract equals(other: AbstractComponent): boolean;
}

export class Package extends AbstractComponent {
    public components: AbstractComponent[] = [];

    constructor(id: string, name: string, components: AbstractComponent[]) {
        super(id, name, "uml:Package");
        this.components = components;
    }

    equals(other: AbstractComponent): boolean {
        return (
            other instanceof Package &&
            this.id === other.id &&
            this.name === other.name &&
            this.components.length === other.components.length &&
            this.components.every((comp, i) => comp.id === other.components[i].id)
        );
    }
}

export class Interface extends AbstractComponent {
    public ownedOperations: Operation[] = [];

    constructor(id: string, name: string, operations: Operation[]) {
        super(id, name, "uml:Interface");
        this.ownedOperations = operations;
    }

    equals(other: AbstractComponent): boolean {
        return (
            other instanceof Interface &&
            this.id === other.id &&
            this.name === other.name &&
            this.ownedOperations.length === other.ownedOperations.length &&
            this.ownedOperations.every((op, i) => op.id === other.ownedOperations[i].id)
        );
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

    equals(other: AbstractComponent): boolean {
        return (
            other instanceof UMLClass &&
            this.id === other.id &&
            this.name === other.name &&
            this.attributes.length === other.attributes.length &&
            this.operations.length === other.operations.length
        );
    }
}

export class Component extends AbstractComponent {
    public attributes: Attribute[] = [];
    public operations: Operation[] = [];
    public usages: string[] = [];
    public providedInterfaces: string[] = [];

    constructor(id: string, name: string, attributes: Attribute[], operations: Operation[], usages: string[], providedInterfaces: string[]) {
        super(id, name, "uml:Component");
        this.attributes = attributes;
        this.operations = operations;
        this.usages = usages;
        this.providedInterfaces = providedInterfaces;
    }

    equals(other: AbstractComponent): boolean {
        return (
            other instanceof Component &&
            this.id === other.id &&
            this.name === other.name
        );
    }
}

export class Edge {
    constructor(
        public client: string,
        public supplier: string,
        public type: string, // "uml:Generalization" | "uml:InterfaceRealization" | "uml:Usage" | ...
        public usedInterface?: Interface, // Optional: for interface edges
    ) {
    }

    equals(other: Edge): boolean {
        return (
            this.client === other.client &&
            this.supplier === other.supplier &&
            this.type === other.type
        );
    }
}