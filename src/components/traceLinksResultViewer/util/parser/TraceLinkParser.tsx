

// TODO: adjust this to the inputs received from the API request
import {TraceabilityLink} from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/TraceabilityLink";

export function parseTraceLinksFromCSV(content: string): TraceabilityLink[] {
  let links: TraceabilityLink[] = [];
  let lines = content.split("\n");
  lines.shift();
  for (let line of lines) {
    let link = line.split(",");
    if (link.length == 2) {
      links.push(new TraceabilityLink(link[0], link[1]));
    } else if (link.length == 3) {
      links.push(new TraceabilityLink(link[0], link[2]));
    }
  }
  return links;
}
