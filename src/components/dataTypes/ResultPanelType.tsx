import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import DisplayDocumentation from "@/components/traceLinksResultViewer/views/documentation/DocumentationViewer";
import DisplayCodeModel from "@/components/traceLinksResultViewer/views/codeModel/CodeModelViewer";
import DisplayArchitectureModel from "@/components/traceLinksResultViewer/views/architectureModel/ArchitectureModelViewer";
import TraceLinkView from "@/components/traceLinksResultViewer/views/tracelinks/TracelinkViewer";
import {Suspense} from "react";
import InconsistencyViewer from "@/components/traceLinksResultViewer/views/inconsistencies/InconsistencyViewer";
import {FileType} from "@/components/dataTypes/FileType";

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
        case FileType.Inconsistencies_JSON:
            return ResultPanelType.Inconsistencies;
        default:
            throw new Error(`No result view option defined for file type: ${fileType}`);
    }

}