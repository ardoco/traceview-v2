export enum FileType {
    documentation = "Documentation",
    architectureModelUML = "UML",
    architectureModelPCM = "PCM",
    codeModel = "Code Model",
    traceLinks = "TraceLinks",
    None = "Select file type",
    inconsistencies = "Inconsistencies",
}

export function convertStringToFileType(value: string): FileType {
    if ((Object.values(FileType) as Array<string>).includes(value)) {
        return value as FileType;
    } else if (value === "Architecture Model") {
        return FileType.architectureModelUML; // Default to UML
    } else {
        return FileType.None;
    }
}