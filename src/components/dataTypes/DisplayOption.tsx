import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import {FileType} from "@/components/dataTypes/FileType";

export enum DisplayOption {
    TRACELINKS = "TRACELINKS",
    CODE_MODEL = "Code Model",
    ARCHITECTURE_MODEL = "Architecture Model",
    DOCUMENTATION = "DOCUMENTATION",
    INCONSISTENCIES = "INCONSISTENCIES",
}

export function displayOptionName(option: DisplayOption, traceLinkType: TraceLinkType): string {
    switch (option) {
        case DisplayOption.DOCUMENTATION:
            return "Documentation";
        case DisplayOption.CODE_MODEL:
            return "Code Model";
        case DisplayOption.ARCHITECTURE_MODEL:
            return "Architecture Model";
        case DisplayOption.TRACELINKS:
            return traceLinkType.name + " (" + traceLinkType.alternative_name + ") TraceLinks";
        case DisplayOption.INCONSISTENCIES:
            return "Inconsistencies";
        default:
            return "Unknown Panel";
    }
}

export function getResultViewOption(fileType: FileType): DisplayOption {
    switch (fileType) {
        case FileType.DOCUMENTATION:
            return DisplayOption.DOCUMENTATION;
        case FileType.ARCHITECTURE_MODEL_UML:
        case FileType.ARCHITECTURE_MODEL_PCM:
            return DisplayOption.ARCHITECTURE_MODEL;
        case FileType.CODE_MODEL:
            return DisplayOption.CODE_MODEL;
        case FileType.TRACELINKS:
            return DisplayOption.TRACELINKS;
        case FileType.INCONSISTENCIES:
            return DisplayOption.INCONSISTENCIES;
        default:
            throw new Error(`No result view option defined for file type: ${fileType}`);
    }

}