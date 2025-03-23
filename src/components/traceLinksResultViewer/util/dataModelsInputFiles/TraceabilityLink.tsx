export class TraceabilityLink {
    source: string;
    target: string;

    constructor(source: string, target: string) {
        this.source = source;
        this.target = target;
    }

    reversed() {
        return new TraceabilityLink(this.target, this.source);
    }
}