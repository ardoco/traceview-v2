'use client'

import React, {useCallback, useEffect, useMemo, useState} from "react";
import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import {Button, Select} from "@headlessui/react";
import {useHighlightContext} from "@/components/traceLinksResultViewer/views/HighlightContextType";
import {TraceLinkItem} from "@/components/traceLinksResultViewer/views/tracelinks/viewer/TraceLinkItem";
import {ArrowDownTrayIcon} from "@heroicons/react/24/outline";

/**
 * Defines the props for the DisplayRawJsonTracelinks component.
 */
interface TraceLinkViewProps {
    JSONResult?: any;
    traceLinkType: TraceLinkType;
}

/**
 * Component for displaying trace links in a list format, with sorting capabilities.
 * It integrates with a highlight context to manage active trace link highlights.
 *
 * @param {TraceLinkViewProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component displaying the trace links.
 */
export default function TraceLinkView({traceLinkType }: TraceLinkViewProps) {
    const { traceLinks, highlightedTraceLinks} = useHighlightContext();
    const [sortedTraceLinks, setSortedTraceLinks] = useState<TraceLink[]>(traceLinks);
    const [selectedSortMethod, setSelectedSortMethod] = useState<string>("Sort By");
    const [prioritizeHighlights, setPrioritizeHighlights] = useState(false);

    const showCode = useMemo(() => traceLinkType.name !== "SAD_SAM", [traceLinkType.name]);
    const showModel = useMemo(() => traceLinkType.name !== "SAD_CODE", [traceLinkType.name]);
    const showSentence = useMemo(() => traceLinkType.name !== "SAM_CODE", [traceLinkType.name]);

    // Check if trace links are being loaded
    const isLoading = traceLinks.length === 0;

    // Memoize sort methods to prevent re-creation on every render
    const sortMethods = useMemo(() => ({
        "Code": (a: TraceLink, b: TraceLink) => (a.codeElementId || "").localeCompare((b.codeElementId || "")),
        "Model": (a: TraceLink, b: TraceLink) => (a.modelElementId || "").localeCompare((b.modelElementId || "")),
        "Sentence": (a: TraceLink, b: TraceLink) => ((a.sentenceNumber ?? Number.MAX_SAFE_INTEGER) - (b.sentenceNumber ?? Number.MAX_SAFE_INTEGER))
    }), []);

    // Determine available sort options based on the trace link type
    const availableSortOptions = useMemo(() => {
        return Object.keys(sortMethods).filter((option) => {
            switch (traceLinkType.name) {
                case "SAD_SAM": return option !== "Code";
                case "SAD_CODE": return option !== "Model";
                case "SAM_CODE": return option !== "Sentence";
                default: return true;
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
     * Sorts the trace links and updates the state.
     * @param {string} method - The selected sorting method.
     */
    const handleSortChange = useCallback((method: string) => {
        setSelectedSortMethod(method);
        let linksToSort = [...traceLinks];

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

    const handleDownloadClick = () => {
        // create json file with traceLinks
        const dataToExport = {
            traceLinkType: traceLinkType.name,
            traceLinks: sortedTraceLinks
        };
        const data = JSON.stringify(dataToExport, null, 2); //
        console.log('Data to be written:', data);

        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tracelinks.json';
        document.body.appendChild(a);
        a.click();
    }

    // Re-sort whenever traceLinks or highlights change.
    useEffect(() => {
        handleSortChange(selectedSortMethod);
    }, [traceLinks, selectedSortMethod, handleSortChange]);

    return (
        <div className="p-2">
            {/* Sticky header for type and sort control */}

            {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                    Generating trace links, this may take a few moments...
                </div>
            ) : (
                <>
                    <div
                        className="sticky top-10 flex justify-between items-start bg-white pb-5 z-10 border-b pt-2 px-2">

                        <div className="flex justify-between items-center flex-wrap gap-4 w-full">
                            <div className="text-sm font-medium">
                                <strong>Type:</strong> {traceLinkType.name}
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="text-sm text-gray-600">Sort by:</label>

                                <select
                                    value={selectedSortMethod}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className={`border rounded px-2 py-1 pr-8 focus:ring-2 focus:outline-none text-sm`}
                                >
                                    <option value="None">None</option>
                                    {availableSortOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    className={`h-8 rounded px-3 py-1 text-sm transition-colors border ${
                                        prioritizeHighlights
                                            ? "border-gruen text-gruen bg-gruen/10 font-semibold"
                                            : "border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                    onClick={() => setPrioritizeHighlights((prev) => !prev)}
                                >
                                    {prioritizeHighlights ? "Highlight ↑" : "Highlight ↓"}
                                </button>

                                <Button onClick={handleDownloadClick} className=" text-gray-700 hover:text-gray-200">
                                    <ArrowDownTrayIcon className="w-5 h-5"/>
                                </Button>

                            </div>
                        </div>
                    </div>
                    <ul className="space-y-2">
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
                </>
            )}
        </div>
    );
}