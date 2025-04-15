

export class TraceLink {
    sentenceId: string;
    modelElementId: string;
    codeElementId: string;

    constructor(sentenceId: string, modelElementId: string, codeElementId: string) {
        this.sentenceId = sentenceId;
        this.modelElementId = modelElementId;
        this.codeElementId = codeElementId;
    }

    // Function to create a unique traceLinkID
    createTraceLinkID() {
        return `${this.sentenceId ?? ''}_${this.modelElementId ?? ''}_${this.codeElementId ?? ''}`;
    };

}