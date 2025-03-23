/**
 * This file has been taken from the repository https://github.com/ArDoCo/TraceView.
 * The original file can be found here: https://github.com/ArDoCo/TraceView/blob/main/src/artifacts/uml.ts
 */

export class UML2Operation {
    protected identifier: string;
    protected name: string;

    constructor(identifier: string, name: string) {
        this.identifier = identifier;
        this.name = name;
    }
}

export abstract class UMLAbstractComponent {
    protected identifier: string;
    protected name: string;
    protected extendz: UMLAbstractComponent[];
    protected uses: UMLAbstractComponent[];
    protected operations: UML2Operation[];
    protected children: UMLAbstractComponent[];

    constructor(
        identifier: string,
        name: string,
        operations: { identifier: string; name: string }[],
    ) {
        this.identifier = identifier;
        this.name = name;
        this.extendz = [];
        this.uses = [];
        this.operations = [];
        for (let operation of operations) {
            this.operations.push(
                new UML2Operation(operation.identifier, operation.name),
            );
        }
        this.children = [];
    }

    addExtends(extendz: UMLAbstractComponent) {
        this.extendz.push(extendz);
    }

    addUses(uses: UMLAbstractComponent) {
        this.uses.push(uses);
    }

    getIdentifier(): string {
        return this.identifier;
    }

    getName(): string {
        return this.name;
    }

    getExtends(): UMLAbstractComponent[] {
        return this.extendz;
    }

    getUses(): UMLAbstractComponent[] {
        return this.uses;
    }

    addChild(child: UMLAbstractComponent) {
        if (this.children.indexOf(child) < 0) {
            this.children.push(child);
        }
    }

    getChildComponents(): UMLAbstractComponent[] {
        return this.children;
    }

    abstract isInterface(): boolean;
}

export class UMLComponent extends UMLAbstractComponent {
    constructor(identifier: string, name: string) {
        super(identifier, name, []);
    }

    isInterface(): boolean {
        return false;
    }
}

export class UMLInterface extends UMLAbstractComponent {
    constructor(
        identifier: string,
        name: string,
        operations: { identifier: string; name: string }[],
    ) {
        super(identifier, name, operations);
    }

    isInterface(): boolean {
        return true;
    }
}

export class UMLModel {
    protected elements: UMLAbstractComponent[];
    constructor(
        components: UMLAbstractComponent[],
        interfaces: UMLAbstractComponent[],
    ) {
        this.elements = components.concat(interfaces);
    }

    getElements(): UMLAbstractComponent[] {
        return this.elements;
    }
}
