import {Sentence} from "@/components/traceLinksResultViewer/views/documentation/dataModel/DocumentationSentence";

export function parseDocumentationText(content: string): Sentence[] {
    let sentences: Sentence[] = [];
    let lines = content.split("\n");
    let lineIndex: number = 0;
    for (let line of lines) {
        if (line.trim().length === 0) {
            continue;
        }
        lineIndex++;
        sentences.push(new Sentence(line, lineIndex));
    }
    return sentences;
}