export enum FileType {
    DOCUMENTATION = "Documentation",
    ARCHITECTURE_MODEL_UML = "UML",
    ARCHITECTURE_MODEL_PCM = "PCM",
    CODE_MODEL = "Code Model",
    TRACELINKS = "TraceLinks",
    INCONSISTENCIES = "Inconsistencies",
    NONE = "Select file type",
}

export function convertStringToFileType(value: string): FileType {
    if ((Object.values(FileType) as Array<string>).includes(value)) {
        return value as FileType;
    } else if (value === "Architecture Model") {
        return FileType.ARCHITECTURE_MODEL_UML; // Default to UML
    } else {
        return FileType.NONE;
    }
}