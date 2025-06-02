import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";

export function parseTraceLinksFromJSON(data:any): TraceLink[] {

  try {
    // Ensure the traceLinks property exists
    const traceLinksData: TraceLink[] = data.traceLinks || [];
    const traceLinkType = data.traceLinkType || 'unknown';
    let traceLinks:TraceLink[] = [];

    if (traceLinkType === 'SAD_CODE') {
      traceLinks = traceLinksData.map((entry:any) => {
        const sentenceId = parseInt(entry.sentenceNumber);
        const codeCompilationUnit = entry.codeCompilationUnit; // TODO: substitute with id
        // const modelElementId = entry.modelElementId;
        // new TraceLink(sentenceId, "", codeElementId);
        return new TraceLink(sentenceId, "", codeCompilationUnit);
      });
    } else if (traceLinkType === 'SAM_CODE') {
      traceLinks = traceLinksData.map((entry:any) => {
        const modelElementId = entry.modelElementId;
        const codeElementId = entry.codeElementId;
        return new TraceLink(null, modelElementId, codeElementId);
      });

    } else if (traceLinkType === 'SAD_SAM_CODE') {
      traceLinks = traceLinksData.map((entry:any) => {
        const sentenceId = parseInt(entry.sentenceNumber);
        const codeCompilationUnit = entry.codeCompilationUnit; // TODO: substitute with id
        const modelElementId = "" // TODO: substitute with id
        // const modelElementId = entry.modelElementId;
        // const codeElementId = entry.codeElementId;
        // return new TraceLink(sentenceId, modelElementId, codeElementId);
        return new TraceLink(sentenceId, modelElementId, codeCompilationUnit);
      });

    } else if (traceLinkType === 'SAD_SAM') {
      traceLinks = traceLinksData.map((entry:any) => {
        const sentenceId = parseInt(entry.sentenceNumber);
        const modelElementId = entry.modelElementUid;
        return new TraceLink(sentenceId, modelElementId, "");
      });

    } else {
      console.warn('Error parsing JSON. Unknown trace link type:', traceLinkType);
    }
    return traceLinks;

  } catch (error) {
    console.error('Error parsing JSON:', error);
    return [];
  }
}
