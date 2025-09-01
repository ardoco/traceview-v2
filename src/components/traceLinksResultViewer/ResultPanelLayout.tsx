import React from "react";
import {PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import ResultPanel from "@/components/traceLinksResultViewer/ResultPanel";
import {ResultType} from "@/components/dataTypes/ResultType";
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";

/**
 * Props for the ResultPanelsLayout component.
 */
interface ResultPanelsLayoutProps {
    /** The unique ID associated with the result. */
    id: string;
    /** The list of available result panel types to display. */
    displayOptions: ResultType[];
    /** The type of trace link, used for specific panel behaviors. */
    traceLinkType: TraceLinkType;
    /** Callback function to set the currently selected view for the full-screen dialog. */
    setSelectedDialogView: (view: ResultType | null) => void;
}

/**
 * Renders the layout of result panels using `react-resizable-panels`.
 * It dynamically creates `ResultPanel` components based on `displayOptions`.
 *
 * @param {ResultPanelsLayoutProps} props - The props for the component.
 * @returns {JSX.Element} The rendered panel group with result panels.
 */
export default function ResultPanelsLayout({
                                               id,
                                               displayOptions,
                                               traceLinkType,
                                               setSelectedDialogView,
                                           }: ResultPanelsLayoutProps) {
    const panelsToRender = displayOptions.slice(0, 3);

    return (
        <PanelGroup direction="horizontal" className="h-full">
            {panelsToRender.map((resultViewOption, index) => (
                <React.Fragment key={index}>
                    <ResultPanel
                        collapsible={index === 0 || index === panelsToRender.length - 1} // Only first and last panels are collapsible
                        displayOptions={displayOptions}
                        defaultView={resultViewOption}
                        setSelectedDialogView={setSelectedDialogView}
                        id={id}
                        traceLinkType={traceLinkType}
                    />
                    {index !== panelsToRender.length - 1 && <PanelResizeHandle className="w-0.5 bg-gruen"/>}
                </React.Fragment>
            ))}
        </PanelGroup>
    );
}

