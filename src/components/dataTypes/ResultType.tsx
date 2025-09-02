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
        case FileType.documentation:
            return ResultType.Documentation;
        case FileType.architectureModelUML:
        case FileType.architectureModelPCM:
            return ResultType.Architecture_Model;
        case FileType.codeModel:
            return ResultType.Code_Model;
        case FileType.traceLinks:
            return ResultType.TraceLinks;
        case FileType.inconsistencies:
            return ResultType.Inconsistencies;
        default:
            throw new Error(`No result view option defined for file type: ${fileType}`);
    }

}