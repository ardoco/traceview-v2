export class Sentence {
    content: string;
    identifier: number;

    constructor(content: string, identifier: number) {
        this.content = content;
        this.identifier = identifier;
    }

    public getIdentifier() {
        return this.identifier;
    }

    public getContent() {
        return this.content;
    }
}
