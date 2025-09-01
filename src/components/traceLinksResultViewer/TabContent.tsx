'use client'

import DisplayDocumentation from "@/components/traceLinksResultViewer/views/documentation/DocumentationViewer";
import DisplayCodeModel from "@/components/traceLinksResultViewer/views/codeModel/CodeModelViewer";
import DisplayArchitectureModel from "@/components/traceLinksResultViewer/views/architectureModel/ArchitectureModelViewer";
import TraceLinkView from "@/components/traceLinksResultViewer/views/tracelinks/TracelinkViewer";
import InconsistencyViewer from "@/components/traceLinksResultViewer/views/inconsistencies/InconsistencyViewer";
import {ResultType} from "@/components/dataTypes/ResultType";

export function getResultPanel(option: ResultType, projectId:string, headerOffset=0) {
    switch (option) {
        case ResultType.Documentation:
            return <DisplayDocumentation id={projectId}/>;
        case ResultType.Code_Model:
            return <DisplayCodeModel id={projectId}/>;
        case ResultType.Architecture_Model:
            return <DisplayArchitectureModel id={projectId}/>;
        case ResultType.TraceLinks:
            return <TraceLinkView headerOffset={headerOffset}/>;
        case ResultType.Inconsistencies:
            return <InconsistencyViewer headerOffset={headerOffset}/>
        default:
            return null;
    }
}