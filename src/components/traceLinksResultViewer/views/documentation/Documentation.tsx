'use client'

import React, {useEffect, useState} from "react";
import {FileType} from "@/components/dataTypes/FileType";
import {
    parseDocumentationText
} from "@/components/traceLinksResultViewer/views/documentation/parser/DocumentationParser";
import {Sentence} from "@/components/traceLinksResultViewer/views/documentation/dataModel/DocumentationSentence";
import TooltipInstruction from "@/components/traceLinksResultViewer/TooltipInstruction";
import {SentenceView} from "@/components/traceLinksResultViewer/views/documentation/viewer/SentenceView";
import {deleteProjectFile, loadProjectFile} from "@/util/ClientFileStorage";
import ViewProps from "@/components/traceLinksResultViewer/views/ViewProps";

export default function DisplayDocumentation({id}: ViewProps) {
    const [sentences, setSentences] = useState<Sentence[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState<boolean>(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        // Only run loadModel if the component has mounted on the client
        if (!isMounted || !id) {
            if (id) setIsLoading(false);
            return;
        }

        async function loadModel() {
            setIsLoading(true);
            setError(null);
            try {
                // Ensure loadProjectFile is only called client-side
                if (typeof window !== "undefined" && sentences.length === 0) {
                    const result = await loadProjectFile(id, FileType.Architecture_Documentation, false);

                    if (!result) {
                        console.warn("No project file found for ID:", id);
                        setSentences([]);
                        setIsLoading(false);
                        return;
                    }
                    setSentences(parseDocumentationText(result.content));
                } else {
                    console.warn("loadModel called on server, skipping ClientFileStorage.");
                }
            } catch (e: any) {
                // console.error("Failed to load or parse architecture model:", e);
                setError(`Failed to load model: ${e.message}`);
                setSentences([]);
            } finally {
                setIsLoading(false);
            }
        }
        loadModel();
    }, [id, isMounted]); // Re-run when id or isMounted changes

    if (!isMounted || isLoading) {
        return <div className="flex justify-center items-center h-full">Loading architecture model...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">An error occurred: {error}</div>;
    }

    return (
        <div className="relative" style={{height: "calc(100% - 40px)"}}>
            <ul className={"space-y-2 max-h-full overflow-y-auto"}>
                {sentences.map((sentence, index) => <SentenceView sentence={sentence} key={index}/>)}
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

