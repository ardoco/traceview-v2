// Result Display Component
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import ResultView from "@/components/traceLinksResultViewer/ResultViewer";
import {ResultViewOptions} from "@/components/dataTypes/ResultViewOptions";

export function ResultDisplay({result}: { result: any }) {

const displayOptions = [
    ResultViewOptions.Documentation,
    ResultViewOptions.Code_Model, ResultViewOptions.Architecture_Model, ResultViewOptions.Raw_JSON];

    return (
        <div className="bg-white z-1 relative h-full">
            <PanelGroup direction="horizontal" className="h-full">
                <ResultView collapsible={true} JSONResult={result} displayOptions={displayOptions} defaultView={ResultViewOptions.Documentation}/>
                <PanelResizeHandle className="w-1 bg-black"/>
                <ResultView collapsible={false} JSONResult={result} displayOptions={displayOptions} defaultView={ResultViewOptions.Raw_JSON}/>
                <PanelResizeHandle className="w-1 bg-black"/>
                <ResultView collapsible={true} JSONResult={result} displayOptions={displayOptions} defaultView={ResultViewOptions.Architecture_Model}/>
            </PanelGroup>
        </div>
    );
}