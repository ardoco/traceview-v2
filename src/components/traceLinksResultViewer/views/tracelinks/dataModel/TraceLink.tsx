/**
 * Represents a trace link between a sentence, a model element, and a code element.
 */
export class TraceLink {
    sentenceNumber: number | null;
    modelElementId: string;
    codeElementId: string;
    id: string;

    /**
     * Constructs a new instance of the `TraceLink` class.
     *
     * @param sentenceNumber - The identifier of the sentence, or `null` if no sentence is associated.
     * @param modelElementId - The identifier of the architectural model element.
     * @param codeElementId - The identifier of the code element.
     */
    constructor(sentenceNumber: number | null, modelElementId: string, codeElementId: string) {
        this.sentenceNumber = sentenceNumber;
        this.modelElementId = modelElementId;
        this.codeElementId = codeElementId;
        this.id = `${modelElementId}-${codeElementId}-${sentenceNumber}`;
    }

}