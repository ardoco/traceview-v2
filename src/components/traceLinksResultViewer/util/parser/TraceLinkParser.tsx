import {TraceLink} from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/TraceLink";

// TODO: adjust this to the inputs received from the API request

// export function parseTraceLinksFromCSV(content: string): TraceabilityLink[] {
//   let links: TraceabilityLink[] = [];
//   let lines = content.split("\n");
//   lines.shift();
//   for (let line of lines) {
//     let link = line.split(",");
//     if (link.length == 2) {
//       links.push(new TraceabilityLink(link[0], link[1]));
//     } else if (link.length == 3) {
//       links.push(new TraceabilityLink(link[0], link[2]));
//     }
//   }
//   return links;
// }

export function parseTraceLinksFromJSON(data:any): TraceLink[] {
  let traceLinks: TraceLink[] = [];

  try {


    // Ensure the traceLinks property exists
    const traceLinksData: TraceLink[] = data.traceLinks || [];


    const traceLinkType = data.traceLinkType || 'unknown';
    let traceLinks:TraceLink[] = [];

    if (traceLinkType === 'SAD_CODE') {
      traceLinks = traceLinksData.map((entry:any) => {
        const sentenceId = entry.sentenceNumber;
        const codeCompilationUnit = entry.codeCompilationUnit; // TODO: substitute with id
        // const modelElementId = entry.modelElementId;
        // new TraceLink(sentenceId, "", codeElementId);
        return new TraceLink(sentenceId, "", codeCompilationUnit);
      });
    } else if (traceLinkType === 'SAM_CODE') {
      traceLinks = traceLinksData.map((entry:any) => {
        const modelElementId = entry.modelElementId;
        const codeElementId = entry.codeElementId;
        return new TraceLink("", modelElementId, codeElementId);
      });

    } else if (traceLinkType === 'SAD_SAM_CODE') {
      traceLinks = traceLinksData.map((entry:any) => {
        const sentenceId = entry.sentenceNumber;
        const codeCompilationUnit = entry.codeCompilationUnit; // TODO: substitute with id
        const modelElementId = "" // TODO: substitute with id
        // const modelElementId = entry.modelElementId;
        // const codeElementId = entry.codeElementId;
        // return new TraceLink(sentenceId, modelElementId, codeElementId);
        return new TraceLink(sentenceId, modelElementId, codeCompilationUnit);
      });

    } else if (traceLinkType === 'SAD_SAM') {
      traceLinks = traceLinksData.map((entry:any) => {
        const sentenceId = entry.sentenceNumber;
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
