export enum FileType {
    Architecture_Documentation = "Documentation",
    Architecture_Model_UML = "UML",
    Architecture_Model_PCM = "PCM",
    Code_Model = "Code Model",
    None = "Select file type",
}

export function convertStringToFileType(value: string): FileType {
    return (Object.values(FileType) as Array<string>).includes(value) ? (value as FileType) : FileType.None;
}