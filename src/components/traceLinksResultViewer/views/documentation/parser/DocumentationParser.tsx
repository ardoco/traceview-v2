import {Sentence} from "@/components/traceLinksResultViewer/views/documentation/dataModel/DocumentationSentence";

export function parseDocumentationText(content: string): Sentence[] {
    let sentences: Sentence[] = [];

    const cleanedContent = content
        .replace(/\r\n/g, '\n')  // Normalize line endings
        .replace(/\n\s*\n\s*\n/g, '\n\n')  // Remove excessive blank lines
        .trim();

    // Split into sentences only when .!? is followed by whitespace or newline
    const sentenceParts = cleanedContent.split(/([.!?])(?=\s|\n|$)/);

    let sentenceIndex = 0;
    let currentSentence = '';

    for (let i = 0; i < sentenceParts.length; i++) {
        const part = sentenceParts[i];

        if (part === '.' || part === '!' || part === '?') {
            currentSentence += part;

            const nextPart = i + 1 < sentenceParts.length ? sentenceParts[i + 1] : '';
            if (nextPart.match(/^\s/) || i === sentenceParts.length - 1) {
                const trimmed = currentSentence.trim();
                if (trimmed.length > 0) {
                    sentenceIndex++;
                    sentences.push(new Sentence(trimmed, sentenceIndex));
                }
                currentSentence = '';
            }
        } else {
            currentSentence += part;
        }
    }

    const remaining = currentSentence.trim();
    if (remaining.length > 0) {
        sentenceIndex++;
        sentences.push(new Sentence(remaining, sentenceIndex));
    }

    return sentences;
}