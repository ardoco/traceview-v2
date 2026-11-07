import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";
import {TraceLinkTypes} from "@/components/dataTypes/TraceLinkTypes";

/**
 * Raw trace link entry as returned by the ARDoCo API. Which fields are present depends on the trace link type.
 */
export interface RawTraceLink {
    sentenceNumber?: string | number;
    modelElementId?: string;
    modelElementName?: string;
    codeElementId?: string;
    codeElementName?: string;
}

export function parseTraceLinksFromJSON(traceLinkType: string, traceLinksJson: RawTraceLink[] | null | undefined): TraceLink[] {

    try {
        // Ensure the trace links property exists
        const traceLinksData: RawTraceLink[] = traceLinksJson || [];
        let traceLinks: TraceLink[] = [];

        if (traceLinkType === TraceLinkTypes.SAD_CODE.name || traceLinkType === 'SAD_CODE') {
            traceLinks = traceLinksData.map((entry) => {
                const sentenceNumber = parseInt(String(entry.sentenceNumber)) + 1;
                const codeElementId = entry.codeElementId as string;
                const codeElementName = entry.codeElementName || "";
                return new TraceLink(sentenceNumber, "", "", codeElementId, codeElementName);
            });
        } else if (traceLinkType === TraceLinkTypes.SAM_CODE.name || traceLinkType === 'SAM_CODE') {
            traceLinks = traceLinksData.map((entry) => {
                const modelElementId = entry.modelElementId as string;
                const modelElementName = entry.modelElementName || "";
                const codeElementId = entry.codeElementId as string;
                const codeElementName = entry.codeElementName || "";
                return new TraceLink(null, codeElementId, codeElementName, modelElementId, modelElementName);
            });

        } else if (traceLinkType === TraceLinkTypes.SAD_SAM_CODE.name || traceLinkType === 'SAD_SAM_CODE') {
            traceLinks = traceLinksData.map((entry) => {
                const sentenceNumber = parseInt(String(entry.sentenceNumber)) + 1;
                const modelElementId = entry.modelElementId as string;
                const modelElementName = entry.modelElementName || "";
                const codeElementId = entry.codeElementId as string;
                const codeElementName = entry.codeElementName || "";
                return new TraceLink(sentenceNumber, modelElementId, modelElementName, codeElementId, codeElementName);
            });

        } else if (traceLinkType === TraceLinkTypes.SAD_SAM.name || traceLinkType === 'SAD_SAM') {
            traceLinks = traceLinksData.map((entry) => {
                const sentenceNumber = parseInt(String(entry.sentenceNumber)) + 1;
                const modelElementId = entry.modelElementId as string;
                const modelElementName = entry.modelElementName || "";
                return new TraceLink(sentenceNumber, modelElementId, modelElementName, "", "");
            });

        } else {
            console.error('Error parsing JSON. Unknown trace link type:', traceLinkType);
        }
        return traceLinks;

    } catch (error) {
        console.error('Error parsing JSON:', error);
        return [];
    }
}
