export class NLSentence{
    content: string;
    identifier: string;

    constructor(content: string, identifier: string) {
        this.content = content;
        this.identifier = identifier;
    }

    getIdentifier() {
        return this.identifier;
    }

    public getContent() {
        return this.content;
    }
}
