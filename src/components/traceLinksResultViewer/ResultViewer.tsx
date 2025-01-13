import { Panel } from "react-resizable-panels";
import Dropdown from "@/components/inputComponents/Dropdown";
import React, { useState } from "react";
import DisplayDocumentation from "@/components/traceLinksResultViewer/views/Documentation";
import DisplayCodeModel from "@/components/traceLinksResultViewer/views/CodeModel";
import DisplayArchitectureModel from "@/components/traceLinksResultViewer/views/ArchitectureModel";
import DisplayRawJsonTracelinks from "@/components/traceLinksResultViewer/views/RawJsonTracelinks";
import {ResultViewOptions} from "@/components/dataTypes/ResultViewOptions";

interface ResultViewProps {
    collapsible: boolean;
    JSONResult: any;
    displayOptions: ResultViewOptions[];
    defaultView: ResultViewOptions;

}

export default function ResultView({ collapsible, JSONResult, displayOptions, defaultView }: ResultViewProps) {
    const [selectedView, setSelectedView] = useState(defaultView);

    const handleOptionChange = (value: ResultViewOptions) => {
        setSelectedView(value);
    };

    return (
        <Panel
            minSize={10}
            className="h-full overflow-y-auto"
            style={{ overflowY: "auto", overflowX: "auto" }}
            collapsible={collapsible} // Use the input prop here
            collapsedSize={0}
        >
        <div className="sticky top-0">
            <Dropdown options={displayOptions} selectedValue={selectedView} onChange={handleOptionChange} />
        </div>

        {selectedView === ResultViewOptions.Documentation && <DisplayDocumentation JSONResult={JSONResult}/>}
        {selectedView === ResultViewOptions.Code_Model && <DisplayCodeModel JSONResult={JSONResult}/>}
        {selectedView === ResultViewOptions.Architecture_Model && <DisplayArchitectureModel JSONResult={JSONResult}/>}
        {selectedView === ResultViewOptions.Raw_JSON && <DisplayRawJsonTracelinks JSONResult={JSONResult}/>}

        </Panel>
    );
}
