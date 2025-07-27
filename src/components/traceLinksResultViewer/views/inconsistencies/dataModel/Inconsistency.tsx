export enum InconsistencyType {
    MissingModelInstance = 'MissingModelInstance',
    MissingTextForModelElement = 'MissingTextForModelElement',
}

export class Inconsistency {
    type: InconsistencyType;
    reason: string;

    constructor(type: InconsistencyType, reason:string) {
        this.type = type;
        this.reason = reason;
    }

    equals(other: Inconsistency): boolean {
        return this.type === other.type && this.reason === other.reason;
    }
}

export class MissingModelInstanceInconsistency extends Inconsistency {
    sentenceNumber: number;

    constructor(reason: string, sentenceNumber: number) {
        super(InconsistencyType.MissingModelInstance, reason);
        this.sentenceNumber = sentenceNumber
    }

    equals(other: Inconsistency): boolean {
        if (!(other instanceof MissingModelInstanceInconsistency)) {
            return false;
        }
        return super.equals(other) && this.sentenceNumber === other.sentenceNumber;
    }
}

export class MissingTextForModelElementInconsistency extends Inconsistency {
    modelElementId: string;

    constructor(reason: string, modelElementId: string) {
        super(InconsistencyType.MissingTextForModelElement, reason);
        this.modelElementId = modelElementId;
    }

    equals(other: Inconsistency): boolean {
        if (!(other instanceof MissingTextForModelElementInconsistency)) {
            return false;
        }
        return super.equals(other) && this.modelElementId === other.modelElementId;
    }
}