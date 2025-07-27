import {Sentence} from "@/components/traceLinksResultViewer/views/documentation/dataModel/DocumentationSentence";

export function parseDocumentationText(content: string): Sentence[] {
    let sentences: Sentence[] = [];
    let lines = content.split("\n");
    let lineIndex: number = 1;
    for (let line of lines) {
        lineIndex++;
        if (line.trim().length === 0) {
            continue;
        }
        sentences.push(new Sentence(line, "" + lineIndex));
    }
    return sentences;
}