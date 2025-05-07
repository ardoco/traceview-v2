import React, {useEffect, useState} from "react";
import {useHighlightContext} from "@/components/traceLinksResultViewer/util/HighlightContextType";
import {TraceLink} from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/TraceLink";
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import {Select} from "@headlessui/react";
import TooltipInstruction from "@/components/traceLinksResultViewer/TooltipInstruction";

interface DisplayRawJsonTracelinksProps {
    JSONResult?: any;
    traceLinkType: TraceLinkType;
}

export default function DisplayRawJsonTracelinks({JSONResult, traceLinkType}: DisplayRawJsonTracelinksProps) {
    const {traceLinks, highlightSingleTraceLink, highlightedTraceLinks} = useHighlightContext();
    const [sortedTraceLinks, setSortedTraceLinks] = useState<TraceLink[]>(traceLinks);
    const [selectedSortMethod, setSelectedSortMethod] = useState<string>("Sort By");

    const sortMethods = {
        "Code": (a: TraceLink, b: TraceLink) =>
            (a.codeElementId || "").localeCompare((b.codeElementId || "")),
        "Model": (a: TraceLink, b: TraceLink) =>
            (a.modelElementId || "").localeCompare((b.modelElementId || "")),
        "Sentence": (a: TraceLink, b: TraceLink) =>
            ((a.sentenceId ?? Number.MAX_SAFE_INTEGER) - (b.sentenceId ?? Number.MAX_SAFE_INTEGER))
    };

    useEffect(() => {
        setSortedTraceLinks(traceLinks);
    }, [traceLinks]);

    const availableSortOptions = Object.keys(sortMethods).filter((option) => {
        if (traceLinkType.name === "SAD-SAM") return option !== "Code";
        if (traceLinkType.name === "SAD-Code") return option !== "Model";
        if (traceLinkType.name === "SAM-Code") return option !== "Sentence";
        return true;
    });


    const handleSortChange = (sortMethod: string) => {
        setSelectedSortMethod(sortMethod);
        setSortedTraceLinks([...traceLinks].sort(sortMethods[sortMethod]));
    }

    const showCode = traceLinkType.name !== "SAD-SAM";
    const showModel = traceLinkType.name !== "SAD-Code";
    const showSentence = traceLinkType.name !== "SAM-Code";


    return (
        <div className="p-2">

             {/*top-10 is a very dirty way of making the header sticky while not overlapping with the selection menu above.*/}
            <div className="sticky top-10 flex bg-white flex justify-between items-center pb-4">
                <div><strong>Type: </strong>{traceLinkType.name}</div>
                {/*drop down*/}
                <Select value={selectedSortMethod} onChange={(e) => handleSortChange(e.target.value as string)}
                        className="border rounded px1 py-1 focus:ring-2 focus:ring-2 focus:border-gruen focus:outline-none">
                    <option disabled>Sort By</option>
                    {availableSortOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </Select>
            </div>


            <ul className="space-y-2">
                {sortedTraceLinks.map((link, idx) => (
                    <li
                        key={idx}
                        className={`p-2 border rounded cursor-pointer ${
                            highlightedTraceLinks.includes(link)
                                ? "bg-yellow-300"
                                : "hover:bg-gray-100"
                        }`}
                        onClick={() => highlightSingleTraceLink(link)}
                    >

                        {showCode &&
                            <div className={"truncate"} title={link.codeElementId}>
                                <strong>Code Id:</strong> {link.codeElementId}
                            </div>}
                        {showModel &&
                            <div className={"truncate max-w-full"} title={link.modelElementId}>
                                <strong>Model Id:</strong> {link.modelElementId}
                            </div>}
                        {showSentence &&
                            <div className={"truncate max-w-full"} title={link.sentenceId}>
                                <strong>Sentence:</strong> {link.sentenceId}
                            </div>}
                    </li>
                ))}
            </ul>


        </div>
    );

}

// return (
//     <div className="p-4">
//         <pre>{JSONResult != null ? JSON.stringify(JSONResult, null, 2) : "Loading"}</pre>
//     </div>
// )

//const parsedResult = JSONResult ? JSON.parse(JSONResult) : null;

