/**
 * Represents a trace link between a sentence, a model element, and a code element.
 */
export class TraceLink {
    sentenceId: number | null;
    modelElementId: string;
    codeElementId: string;

    /**
     * Constructs a new instance of the `TraceLink` class.
     *
     * @param sentenceId - The identifier of the sentence, or `null` if no sentence is associated.
     * @param modelElementId - The identifier of the architectural model element.
     * @param codeElementId - The identifier of the code element.
     */
    constructor(sentenceId: number | null, modelElementId: string, codeElementId: string) {
        this.sentenceId = sentenceId;
        this.modelElementId = modelElementId;
        this.codeElementId = codeElementId;
    }

}