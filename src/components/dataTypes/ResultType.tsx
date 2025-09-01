import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import {FileType} from "@/components/dataTypes/FileType";

export enum ResultType {
    TraceLinks = "TraceLinks",
    Code_Model = "Code Model",
    Architecture_Model = "Architecture Model",
    Documentation = "Documentation",
    Inconsistencies = "Inconsistencies",
}

export function displayOptionName(option: ResultType, traceLinkType: TraceLinkType): string {
    switch (option) {
        case ResultType.Documentation:
            return "Documentation";
        case ResultType.Code_Model:
            return "Code Model";
        case ResultType.Architecture_Model:
            return "Architecture Model";
        case ResultType.TraceLinks:
            return traceLinkType.name + " (" + traceLinkType.alternative_name + ") TraceLinks";
        case ResultType.Inconsistencies:
            return "Inconsistencies";
        default:
            return "Unknown Panel";
    }
}

export function getResultViewOption(fileType: FileType): ResultType {
    switch (fileType) {
        case FileType.Architecture_Documentation:
            return ResultType.Documentation;
        case FileType.Architecture_Model_UML:
        case FileType.Architecture_Model_PCM:
            return ResultType.Architecture_Model;
        case FileType.Code_Model:
            return ResultType.Code_Model;
        case FileType.Trace_Link_JSON:
            return ResultType.TraceLinks;
        case FileType.Inconsistencies_JSON:
            return ResultType.Inconsistencies;
        default:
            throw new Error(`No result view option defined for file type: ${fileType}`);
    }

}