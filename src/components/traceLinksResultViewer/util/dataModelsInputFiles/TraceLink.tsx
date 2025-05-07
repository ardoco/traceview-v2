export class TraceLink {
    sentenceId: number | null;
    modelElementId: string;
    codeElementId: string;

    constructor(sentenceId: number | null, modelElementId: string, codeElementId: string) {
        this.sentenceId = sentenceId;
        this.modelElementId = modelElementId;
        this.codeElementId = codeElementId;
    }

    // Function to create a unique traceLinkID
    createTraceLinkID() {
        return `${this.sentenceId ?? ''}_${this.modelElementId ?? ''}_${this.codeElementId ?? ''}`;
    };

}