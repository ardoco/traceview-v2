import {ResultPanelType} from "@/components/dataTypes/ResultPanelType";

export enum FileType {
    Architecture_Documentation = "Documentation",
    Architecture_Model_UML = "UML",
    Architecture_Model_PCM = "PCM",
    Code_Model = "Code Model",
    Trace_Link_JSON = "TraceLinks",
    None = "Select file type",
}

export function convertStringToFileType(value: string): FileType {
    if ((Object.values(FileType) as Array<string>).includes(value)) {
        return value as FileType;
    } else if (value === "Architecture Model") {
        return FileType.Architecture_Model_UML; // Default to UML if "Architecture Model" is provided
    } else {
        return FileType.None; // Return None for any other unrecognized value
    }
}

export function getResultViewOption(fileType: FileType): ResultPanelType {
    switch (fileType) {
        case FileType.Architecture_Documentation:
            return ResultPanelType.Documentation;
        case FileType.Architecture_Model_UML:
        case FileType.Architecture_Model_PCM:
            return ResultPanelType.Architecture_Model;
        case FileType.Code_Model:
            return ResultPanelType.Code_Model;
        case FileType.Trace_Link_JSON:
            return ResultPanelType.TraceLinks;
        default:
            throw new Error(`No result view option defined for file type: ${fileType}`);
    }

}