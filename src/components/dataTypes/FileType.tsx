export enum FileType {
    Architecture_Documentation = "Documentation",
    Architecture_Model_UML = "UML",
    Architecture_Model_PCM = "PCM",
    Code_Model = "Code Model",
    Trace_Link_JSON = "TraceLinks",
    None = "Select file type",
    Inconsistencies_JSON = "Inconsistencies",
}

export function convertStringToFileType(value: string): FileType {
    if ((Object.values(FileType) as Array<string>).includes(value)) {
        return value as FileType;
    } else if (value === "Architecture Model") {
        return FileType.Architecture_Model_UML; // Default to UML
    } else {
        return FileType.None;
    }
}