import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";

export enum ResultPanelType {
    TraceLinks = "TraceLinks",
    Code_Model = "Code Model",
    Architecture_Model = "Architecture Model",
    Documentation = "Documentation",
    Inconsistencies = "Inconsistencies",
}

export function displayOptionName(option: ResultPanelType, traceLinkType: TraceLinkType): string {
    switch (option) {
        case ResultPanelType.Documentation:
            return "Documentation";
        case ResultPanelType.Code_Model:
            return "Code Model";
        case ResultPanelType.Architecture_Model:
            return "Architecture Model";
        case ResultPanelType.TraceLinks:
            return traceLinkType.name + " (" + traceLinkType.alternative_name + ") TraceLinks";
        case ResultPanelType.Inconsistencies:
            return "Inconsistencies";
        default:
            return "Unknown Panel";
    }
}