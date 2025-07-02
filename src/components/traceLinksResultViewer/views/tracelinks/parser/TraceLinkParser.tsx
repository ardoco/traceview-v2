import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";

export function parseTraceLinksFromJSON(data:any): TraceLink[] {

  try {
    // Ensure the traceLinks property exists
    const traceLinksData: TraceLink[] = data.traceLinks || [];
    const traceLinkType = data.traceLinkType || 'unknown';
    let traceLinks:TraceLink[] = [];

    if (traceLinkType === 'SAD_CODE') {
      traceLinks = traceLinksData.map((entry:any) => {
        const sentenceNumber = parseInt(entry.sentenceNumber);
        const codeElementId = entry.codeElementId;
        return new TraceLink(sentenceNumber, "", codeElementId);
      });
    } else if (traceLinkType === 'SAM_CODE') {
      traceLinks = traceLinksData.map((entry:any) => {
        const modelElementId = entry.modelElementId;
        const codeElementId = entry.codeElementId;
        return new TraceLink(null, modelElementId, codeElementId);
      });

    } else if (traceLinkType === 'SAD_SAM_CODE') {
      traceLinks = traceLinksData.map((entry:any) => {
        const sentenceNumber = parseInt(entry.sentenceNumber);
        const modelElementId = entry.modelElementId;
        const codeElementId = entry.codeElementId;
        return new TraceLink(sentenceNumber, modelElementId, codeElementId);
      });

    } else if (traceLinkType === 'SAD_SAM') {
      traceLinks = traceLinksData.map((entry:any) => {
        const sentenceNumber = parseInt(entry.sentenceNumber);
        const modelElementId = entry.modelElementId;
        return new TraceLink(sentenceNumber, modelElementId, "");
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
