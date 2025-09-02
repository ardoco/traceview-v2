import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";
import {TraceLinkTypes} from "@/components/dataTypes/TraceLinkTypes";

export function parseTraceLinksFromJSON(traceLinkType: any, traceLinksJson: any): TraceLink[] {

    try {
        // Ensure the traceLinks property exists
        const traceLinksData: TraceLink[] = traceLinksJson || [];
        let traceLinks: TraceLink[] = [];

        if (traceLinkType === TraceLinkTypes.SAD_CODE.name || traceLinkType === 'SAD_CODE') {
            traceLinks = traceLinksData.map((entry: any) => {
                const sentenceNumber = parseInt(entry.sentenceNumber) + 1;
                const codeElementId = entry.codeElementId;
                const codeElementName = entry.codeElementName || "";
                return new TraceLink(sentenceNumber, "", "", codeElementId, codeElementName);
            });
        } else if (traceLinkType === TraceLinkTypes.SAM_CODE.name || traceLinkType === 'SAM_CODE') {
            traceLinks = traceLinksData.map((entry: any) => {
                const modelElementId = entry.modelElementId;
                const modelElementName = entry.modelElementName || "";
                const codeElementId = entry.codeElementId;
                const codeElementName = entry.codeElementName || "";
                return new TraceLink(null, codeElementId, codeElementName, modelElementId, modelElementName);
            });

        } else if (traceLinkType === TraceLinkTypes.SAD_SAM_CODE.name || traceLinkType === 'SAD_SAM_CODE') {
            traceLinks = traceLinksData.map((entry: any) => {
                const sentenceNumber = parseInt(entry.sentenceNumber) + 1;
                const modelElementId = entry.modelElementId;
                const modelElementName = entry.modelElementName || "";
                const codeElementId = entry.codeElementId;
                const codeElementName = entry.codeElementName || "";
                return new TraceLink(sentenceNumber, modelElementId, modelElementName, codeElementId, codeElementName);
            });

        } else if (traceLinkType === TraceLinkTypes.SAD_SAM.name || traceLinkType === 'SAD_SAM') {
            traceLinks = traceLinksData.map((entry: any) => {
                const sentenceNumber = parseInt(entry.sentenceNumber) + 1;
                const modelElementId = entry.modelElementId;
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
