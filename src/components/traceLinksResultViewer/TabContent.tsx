'use client'

import DisplayDocumentation from "@/components/traceLinksResultViewer/views/documentation/DocumentationViewer";
import DisplayCodeModel from "@/components/traceLinksResultViewer/views/codeModel/CodeModelViewer";
import DisplayArchitectureModel
    from "@/components/traceLinksResultViewer/views/architectureModel/ArchitectureModelViewer";
import TraceLinkView from "@/components/traceLinksResultViewer/views/tracelinks/TracelinkViewer";
import InconsistencyViewer from "@/components/traceLinksResultViewer/views/inconsistencies/InconsistencyViewer";
import {DisplayOption} from "@/components/dataTypes/DisplayOption";

export function getResultPanel(option: DisplayOption, projectId: string, headerOffset = 0) {
    switch (option) {
        case DisplayOption.DOCUMENTATION:
            return <DisplayDocumentation id={projectId}/>;
        case DisplayOption.CODE_MODEL:
            return <DisplayCodeModel id={projectId}/>;
        case DisplayOption.ARCHITECTURE_MODEL:
            return <DisplayArchitectureModel id={projectId}/>;
        case DisplayOption.TRACELINKS:
            return <TraceLinkView headerOffset={headerOffset}/>;
        case DisplayOption.INCONSISTENCIES:
            return <InconsistencyViewer headerOffset={headerOffset}/>
        default:
            return null;
    }
}