'use client';
import {useParams} from "next/navigation";
import React, {useEffect, useState} from "react";
import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";
import {parseTraceLinksFromJSON} from "@/components/traceLinksResultViewer/views/tracelinks/parser/TraceLinkParser";
import {loadProjectFile, loadProjectMetaData} from "@/util/ClientFileStorage";
import {FileType, getResultViewOption} from "@/components/dataTypes/FileType";
import {HighlightProvider} from "@/components/traceLinksResultViewer/views/HighlightContextType";
import {ResultDisplay} from "@/components/traceLinksResultViewer/ResultDisplay";
import {TraceLinkTypes} from "@/components/dataTypes/TraceLinkTypes";
import {ErrorDisplay} from "@/app/view/[id]/page";

export default function ViewProvided() {
    const {id} = useParams<{ id: string }>(); // Get the `id` from the path

    const [traceLinks, setTraceLinks] = useState<TraceLink[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [traceLinkType, setTraceLinkType] = useState<any>(TraceLinkTypes["SAD_SAM_CODE"]); // Default type
    const [uploadedFileTypes, setUploadedFileTypes] = useState<FileType[]>([]); // Track uploaded file types

    const uriDecodedId = decodeURIComponent(id);

    useEffect(() => {
        // Only run loadModel if the component has mounted on the client
        if (!id) {
            return;
        }

        async function getAndSetUploadedFileTypes() {
            const uploadedFileTypes = await loadProjectMetaData(id)
            setUploadedFileTypes(uploadedFileTypes);
        }

        getAndSetUploadedFileTypes();


        async function loadModel() {
            setError(null);
            try {
                // Ensure loadProjectFile is only called client-side
                if (typeof window !== "undefined") {
                    const result = await loadProjectFile(id, FileType.Trace_Link_JSON, true);

                    if (!result) {
                        console.warn("No project file found for ID:", id);
                        setTraceLinks([]);
                        return;
                    }
                    const rawJson = JSON.parse(result.content);
                    setTraceLinks(parseTraceLinksFromJSON(rawJson));
                    setTraceLinkType(TraceLinkTypes[rawJson.traceLinkType] ?? TraceLinkTypes["SAD_SAM_CODE"]);
                } else {
                    console.log("loadModel called on server, skipping ClientFileStorage.");
                }
            } catch (e: any) {
                console.warn("Failed to load or parse provided tracelinks:", e);
                setError(`Failed to load or parse provided tracelinks: ${e.message}`);
                setTraceLinks([]);
            }
        }
        loadModel();

    }, [id]); // Re-run when id changes


    return (
        <>
            {error && <ErrorDisplay message={error} onRetry={() => {
            }} retryAllowed={false}/>}
            <HighlightProvider traceLinks={traceLinks}>
                <ResultDisplay
                    id={uriDecodedId}
                    traceLinkType={traceLinkType}
                    displayOptions={uploadedFileTypes.map(filetype => getResultViewOption(filetype))}/>
            </HighlightProvider>
        </>
    );
}