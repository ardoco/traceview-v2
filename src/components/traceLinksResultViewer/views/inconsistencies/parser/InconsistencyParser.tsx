import {
    Inconsistency,
    InconsistencyType,
    TextEntityAbsentFromModelInconsistency,
    ModelEntityAbsentFromTextInconsistency
} from "@/components/traceLinksResultViewer/views/inconsistencies/dataModel/Inconsistency";


export function parseInconsistenciesFromJSON(data: any): Inconsistency[] {

    return data.map((inconsistency: any) => {
        const reason = inconsistency.reason;
        if (inconsistency.type === InconsistencyType.TextEntityAbsentFromModel) {
            const sentenceNumber = parseInt(inconsistency.sentenceNumber);
            return new TextEntityAbsentFromModelInconsistency(reason, sentenceNumber);
        } else if (inconsistency.type === InconsistencyType.ModelEntityAbsentFromText) {
            const modelElementId = inconsistency.modelElementId;
            return new ModelEntityAbsentFromTextInconsistency(reason, modelElementId);
        } else {
            console.warn(`Unknown inconsistency type: ${inconsistency.type}. Defaulting to TextEntityAbsentFromModel.`);
        }
    });
}