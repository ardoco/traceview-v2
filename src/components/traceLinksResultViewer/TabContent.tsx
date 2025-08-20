'use client'

import DisplayDocumentation from "@/components/traceLinksResultViewer/views/documentation/DocumentationViewer";
import DisplayCodeModel from "@/components/traceLinksResultViewer/views/codeModel/CodeModelViewer";
import DisplayArchitectureModel from "@/components/traceLinksResultViewer/views/architectureModel/ArchitectureModelViewer";
import TraceLinkView from "@/components/traceLinksResultViewer/views/tracelinks/TracelinkViewer";
import InconsistencyViewer from "@/components/traceLinksResultViewer/views/inconsistencies/InconsistencyViewer";
import {ResultPanelType} from "@/components/dataTypes/ResultPanelType";

export function getResultPanel(option: ResultPanelType, projectId:string, headerOffset=0) {
    switch (option) {
        case ResultPanelType.Documentation:
            return <DisplayDocumentation id={projectId}/>;
        case ResultPanelType.Code_Model:
            return <DisplayCodeModel id={projectId}/>;
        case ResultPanelType.Architecture_Model:
            return <DisplayArchitectureModel id={projectId}/>;
        case ResultPanelType.TraceLinks:
            return <TraceLinkView headerOffset={headerOffset}/>;
        case ResultPanelType.Inconsistencies:
            return <InconsistencyViewer headerOffset={headerOffset}/>
        default:
            return null;
    }
}