import React, {useCallback, useEffect, useState} from "react";
import { Sentence } from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/DocumentationSentence";
import {useHighlightContext} from "@/components/traceLinksResultViewer/util/HighlightContextType";


interface NLHighlightingVisualizationProps {
    sentences: Sentence[];
}

const NLHighlightingVisualization: React.FC<NLHighlightingVisualizationProps> = ({ sentences }) => {
    const { highlightedTraceLinks, highlightElement} = useHighlightContext();
    const [localHighlightedIds, setLocalHighlightedIds] = useState<Set<string>>(new Set());

    // Use useCallback to memoize the updateHighlightState function
    // const updateHighlightState = useCallback(() => {
    //     setLocalHighlightedIds(new Set([...highlightedTraceLinks].map(link => link.sentenceId)));
    // }, [highlightedTraceLinks]);

    const updateHighlightState = () => {
        setLocalHighlightedIds(new Set([...highlightedTraceLinks].map(link => link.sentenceId)));
        console.log("Updating highlight state", highlightedTraceLinks);
    }
    //
    // useEffect(() => { // TODO: when i insert this, the component rerenders in an infinite loop
    //     // Subscribe to highlight updates
    //     subscribe(updateHighlightState);
    //     //updateHighlightState(); // Initialize the state
    //
    //     // Cleanup subscription when component unmounts
    //     return () => {
    //         unsubscribe(updateHighlightState); // Clean up subscription
    //     };
    // }, [subscribe, unsubscribe, updateHighlightState]); // Ensure these are stable and don't cause an infinite loop
    //
    // Toggle highlights
    const toggleHighlight = (id: string) => {
        highlightElement(id, "sentenceId"); // Notify context of the new highlight
        setLocalHighlightedIds(new Set([...highlightedTraceLinks].map(link => link.sentenceId)));
        console.log("Updated local highlighted IDs:", localHighlightedIds);
        console.log("Updated highlighted trace links:", highlightedTraceLinks);
    };

    return (
        <div className="w-full p-4 bg-gray-50 rounded-lg">
            {/* Sentence List */}
            <div className="space-y-2">

            </div>
        </div>
    );
};

export default NLHighlightingVisualization;