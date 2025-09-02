'use client'

import React, {useCallback, useEffect, useMemo, useState} from "react";
import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";
import {TraceLinkTypes} from "@/components/dataTypes/TraceLinkTypes";
import {Button} from "@headlessui/react";
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";
import {TraceLinkItem} from "@/components/traceLinksResultViewer/views/tracelinks/viewer/TraceLinkItem";
import {BookmarkIcon} from "@heroicons/react/24/outline";
import DownloadFileComponent from "@/util/DownloadFileComponent";
import LoadingMessage from "@/components/traceLinksResultViewer/Loading";

/**
 * Defines the props for the DisplayRawJsonTracelinks component.
 */
interface TraceLinkViewProps {
    headerOffset?: number;
}

/**
 * Component for displaying traceLinks in a list format, with sorting capabilities.
 * It integrates with a highlight context to manage active trace link highlights.
 *
 * @param {TraceLinkViewProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component displaying the traceLinks.
 */
export default function TraceLinkView({headerOffset = 10}: TraceLinkViewProps) {
    const {traceLinks, traceLinkType, highlightedTraceLinks, loading} = useHighlightContext();
    const [sortedTraceLinks, setSortedTraceLinks] = useState<TraceLink[]>(traceLinks);
    const [selectedSortMethod, setSelectedSortMethod] = useState<string>("Sort By");
    const [prioritizeHighlights, setPrioritizeHighlights] = useState(false);

    const showCode = useMemo(() => traceLinkType.name !== TraceLinkTypes.SAD_SAM.name, [traceLinkType.name]);
    const showModel = useMemo(() => traceLinkType.name !== TraceLinkTypes.SAD_CODE.name, [traceLinkType.name]);
    const showSentence = useMemo(() => traceLinkType.name !== TraceLinkTypes.SAM_CODE.name, [traceLinkType.name]);

    // Memoize sort methods to prevent re-creation on every render
    const sortMethods = useMemo(() => ({
        "Code": (a: TraceLink, b: TraceLink) => (a.codeElementName || a.codeElementId || "").localeCompare((b.codeElementName || b.codeElementId || "")),
        "Model": (a: TraceLink, b: TraceLink) => (a.modelElementName || a.modelElementId || "").localeCompare((b.modelElementName || b.modelElementId || "")),
        "Sentence": (a: TraceLink, b: TraceLink) => ((a.sentenceNumber ?? Number.MAX_SAFE_INTEGER) - (b.sentenceNumber ?? Number.MAX_SAFE_INTEGER))
    }), []);

    // Determine available sort options based on the trace link type
    const availableSortOptions = useMemo(() => {
        return Object.keys(sortMethods).filter((option) => {
            switch (traceLinkType.name) {
                case TraceLinkTypes.SAD_SAM.name:
                    return option !== "Code";
                case TraceLinkTypes.SAD_CODE.name:
                    return option !== "Model";
                case TraceLinkTypes.SAM_CODE.name:
                    return option !== "Sentence";
                default:
                    return true;
            }
        });
    }, [sortMethods, traceLinkType.name]);

    // Reset sortedTraceLinks when the original traceLinks array changes
    useEffect(() => {
        setSortedTraceLinks(traceLinks);
        setSelectedSortMethod("Sort By");
    }, [traceLinks]);

    /**
     * Handles the change in the selected sorting method.
     * Sorts the traceLinks and updates the state.
     * @param {string} method - The selected sorting method.
     */
    const handleSortChange = useCallback((method: string) => {
        setSelectedSortMethod(method);
        const linksToSort = [...traceLinks];

        if (method !== "Sort By") {
            const sorter = sortMethods[method as keyof typeof sortMethods];
            linksToSort.sort(sorter);
        }

        if (prioritizeHighlights) {
            const highlightedSorted = linksToSort.filter(link => highlightedTraceLinks.includes(link));
            const nonHighlightedSorted = linksToSort.filter(link => !highlightedTraceLinks.includes(link));
            setSortedTraceLinks([...highlightedSorted, ...nonHighlightedSorted]);
        } else {
            setSortedTraceLinks(linksToSort);
        }
    }, [traceLinks, sortMethods, highlightedTraceLinks, prioritizeHighlights]);

    const prepareDataToExport = () => {
        const dataToExport = {
            traceLinkType: traceLinkType.name,
            traceLinks: sortedTraceLinks
        };
        return JSON.stringify(dataToExport, null, 2);
    }

    // Re-sort whenever traceLinks or highlights change.
    useEffect(() => {
        handleSortChange(selectedSortMethod);
    }, [traceLinks, selectedSortMethod, handleSortChange]);

    if (loading) {
        return <LoadingMessage title={"Generating traceLinks, this may take a few moments..."}/>;
    }

    if (sortedTraceLinks.length === 0) {
        return <LoadingMessage title={"No traceLinks found."}/>
    }

    return (
        <div className="px-2 pb-2">
            {/*/!* Sticky header for type and sort control *!/*/}
            <div
                className={`sticky flex justify-between items-start bg-white z-10 border-b px-2 pt-2`}
                style={{top: `calc(var(--spacing) * ${headerOffset})`}}>
                <div className="w-full">
                    <div className="flex flex-wrap justify-between items-center gap-1 mb-2">
                        <div className="flex-1">
                            <label className="text-sm text-gray-600">Sort by: </label>

                            <select
                                value={selectedSortMethod}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className={`border-gray-300 rounded px-2 py-1 pr-8 focus:ring-2 focus:outline-none text-sm`}
                            >
                                <option value="None">None</option>
                                {availableSortOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Button
                            className={`rounded px-3 py-0.5 text-sm transition-colors border ${
                                prioritizeHighlights
                                    ? "border-blau text-blau bg-blau/10 hover:text-blau-600 hover:bg-blau-600/10 hover:border-blau-600"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-200"
                            }`}
                            onClick={() => setPrioritizeHighlights((prev) => !prev)}
                        >
                            <BookmarkIcon className="inline h-4 -mt-0.5 mr-1"/>
                            <span className="text-sm/6">Highlights</span>
                        </Button>

                        <DownloadFileComponent
                            fileName={"tracelinks.json"}
                            prepareDataToExport={prepareDataToExport}
                            title={"Download Tracelinks"}
                        />

                    </div>
                </div>
            </div>
            <ul className="space-y-2 pt-2">
                {sortedTraceLinks.map((link, idx) => (
                    <TraceLinkItem
                        key={idx}
                        link={link}
                        showCode={showCode}
                        showModel={showModel}
                        showSentence={showSentence}
                    />
                ))}
            </ul>
        </div>
    );
}