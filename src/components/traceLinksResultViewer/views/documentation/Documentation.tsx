'use client'

import React, {useEffect, useState} from "react";
import {FileType} from "@/components/dataTypes/FileType";
import {
    parseDocumentationText
} from "@/components/traceLinksResultViewer/views/documentation/parser/DocumentationParser";
import {Sentence} from "@/components/traceLinksResultViewer/views/documentation/dataModel/DocumentationSentence";
import TooltipInstruction from "@/components/traceLinksResultViewer/TooltipInstruction";
import {SentenceView} from "@/components/traceLinksResultViewer/views/documentation/viewer/SentenceView";
import {loadProjectFile} from "@/util/ClientFileStorage";
import ViewProps from "@/components/traceLinksResultViewer/views/ViewProps";

export default function DisplayDocumentation({JSONResult, id}: ViewProps) {
    const [sentences, setSentences] = useState<Sentence[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Added loading state
    const [error, setError] = useState<string | null>(null); // Added error state
    const [isMounted, setIsMounted] = useState<boolean>(false); // Track if component has mounted

    useEffect(() => {
        setIsMounted(true); // Set to true once component mounts on client
    }, []);

    useEffect(() => {
        // Only run loadModel if the component has mounted on the client
        if (!isMounted || !id) {
            if (id) setIsLoading(false); // If no id, or not mounted, stop loading if id was present
            return;
        }

        async function loadModel() {
            setIsLoading(true);
            setError(null);
            try {
                // Ensure loadProjectFile is only called client-side
                if (typeof window !== "undefined") {
                    const result = await loadProjectFile(id, FileType.Architecture_Documentation);

                    if (!result) {
                        console.warn("No project file found for ID:", id);
                        setSentences([]);
                        setIsLoading(false);
                        return;
                    }

                    const text = await result.file.text();
                    setSentences(parseDocumentationText(text));
                } else {
                    // This case should ideally not be hit if isMounted is true,
                    // but as a safeguard:
                    console.warn("loadModel called on server, skipping ClientFileStorage.");
                }
            } catch (e: any) {
                console.error("Failed to load or parse architecture model:", e);
                setError(`Failed to load model: ${e.message}`);
                setSentences([]);
            } finally {
                setIsLoading(false);
            }
        }
        loadModel();
    }, [id, isMounted]); // Re-run when id or isMounted changes

    // Initial render (server and first client render before useEffect runs)
    // should be consistent. If not mounted, or loading, show a placeholder.
    if (!isMounted || isLoading) {
        return <div className="flex justify-center items-center h-full">Loading architecture model...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    return (
        <div className="relative" style={{height: "calc(100% - 40px)"}}>
            <ul className={"space-y-2 max-h-full overflow-y-auto"}>
                {sentences.map((sentence, index) => <SentenceView sentence={sentence} index={index} key={index}/>)}
            </ul>

            <TooltipInstruction
                title="Instructions"
                position="bottom-right"
                instructions={[
                    { keyCombo: "Click", description: "Highlight TraceLink from TraceLInks" },
                ]}
            />
        </div>
    );
}

