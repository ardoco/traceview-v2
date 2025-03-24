import {NLSentence} from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/DocumentationSentence";

export function parseNLTXT(content: string): NLSentence[] {
    let sentences: NLSentence[] = [];
    let lines = content.split("\n");
    let lineIndex: number = 0;
    for (let line of lines) {
        lineIndex++;
        if (line.trim().length === 0) {
            continue;
        }
        sentences.push(new NLSentence(line, "" + lineIndex));
    }
    return sentences;
}