import {Sentence} from "@/components/traceLinksResultViewer/views/documentation/dataModel/DocumentationSentence";

    // export function parseDocumentationText(content: string): Sentence[] {
    //     let sentences: Sentence[] = [];
    //     let lines = content.split("\n");
    //     // split each sentence (so far there can be multiple sentences in one line)
    //     let lineIndex: number = 0;
    //     for (let line of lines) {
    //
    //         if (line.length === 0) {
    //             continue;
    //         }
    //         lineIndex++;
    //         sentences.push(new Sentence(line, lineIndex));
    //
    //     }
    //     return sentences;
    // }

export function parseDocumentationText(content: string): Sentence[] {
    let sentences: Sentence[] = [];

    // Clean up the content: normalize whitespace and remove excessive blank lines
    const cleanedContent = content
        .replace(/\r\n/g, '\n')  // Normalize line endings
        .replace(/\n\s*\n\s*\n/g, '\n\n')  // Remove excessive blank lines
        .trim();

    // Split into sentences only when .!? is followed by whitespace or newline
    // This simple approach avoids issues with abbreviations and decimals
    const sentenceParts = cleanedContent.split(/([.!?])(?=\s|\n|$)/);

    let sentenceIndex = 0;
    let currentSentence = '';

    for (let i = 0; i < sentenceParts.length; i++) {
        const part = sentenceParts[i];

        // If this part is a sentence ending punctuation
        if (part === '.' || part === '!' || part === '?') {
            currentSentence += part;

            // Check if next part starts with whitespace/newline or we're at the end
            const nextPart = i + 1 < sentenceParts.length ? sentenceParts[i + 1] : '';
            if (nextPart.match(/^\s/) || i === sentenceParts.length - 1) {
                // This is end of sentence
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

    // Handle any remaining content that doesn't end with punctuation
    const remaining = currentSentence.trim();
    if (remaining.length > 0) {
        sentenceIndex++;
        sentences.push(new Sentence(remaining, sentenceIndex));
    }

    return sentences;
}