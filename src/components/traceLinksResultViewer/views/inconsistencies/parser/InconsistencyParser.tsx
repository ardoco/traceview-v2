import {
    Inconsistency,
    InconsistencyType,
    MissingModelInstanceInconsistency,
    MissingTextForModelElementInconsistency
} from "@/components/traceLinksResultViewer/views/inconsistencies/dataModel/Inconsistency";


export function parseInconsistenciesFromJSON(data: any): Inconsistency[] {

    return data.map((inconsistency: any) => {
        const reason = inconsistency.reason;
        if (inconsistency.type === InconsistencyType.MissingModelInstance) {
            const sentenceNumber = parseInt(inconsistency.sentenceNumber);
            return new MissingModelInstanceInconsistency(reason, sentenceNumber);
        } else if (inconsistency.type === InconsistencyType.MissingTextForModelElement) {
            const modelElementId = inconsistency.modelElementId;
            return new MissingTextForModelElementInconsistency(reason, modelElementId);
        } else {
            console.warn(`Unknown inconsistency type: ${inconsistency.type}. Defaulting to MissingModelInstance.`);
        }
    });
}