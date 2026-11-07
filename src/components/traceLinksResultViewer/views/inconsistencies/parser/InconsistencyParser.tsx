import {
    Inconsistency,
    InconsistencyType,
    TextEntityAbsentFromModelInconsistency,
    ModelEntityAbsentFromTextInconsistency
} from "@/components/traceLinksResultViewer/views/inconsistencies/dataModel/Inconsistency";


/**
 * Raw inconsistency entry as returned by the ARDoCo API.
 */
export interface RawInconsistency {
    type: string;
    reason: string;
    sentenceNumber?: string | number;
    modelElementId?: string;
}

export function parseInconsistenciesFromJSON(data: RawInconsistency[]): Inconsistency[] {

    return data.flatMap((inconsistency): Inconsistency[] => {
        const reason = inconsistency.reason;
        if (inconsistency.type === InconsistencyType.TextEntityAbsentFromModel) {
            const sentenceNumber = parseInt(String(inconsistency.sentenceNumber));
            return [new TextEntityAbsentFromModelInconsistency(reason, sentenceNumber)];
        } else if (inconsistency.type === InconsistencyType.ModelEntityAbsentFromText) {
            const modelElementId = inconsistency.modelElementId as string;
            return [new ModelEntityAbsentFromTextInconsistency(reason, modelElementId)];
        } else {
            console.warn(`Unknown inconsistency type: ${inconsistency.type}. Defaulting to TextEntityAbsentFromModel.`);
            return [];
        }
    });
}