'use client';
import {useParams} from "next/navigation";
import React, {useEffect, useState} from "react";
import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";
import {parseTraceLinksFromJSON} from "@/components/traceLinksResultViewer/views/tracelinks/parser/TraceLinkParser";
import {loadProjectFile, loadProjectMetaData} from "@/util/ClientFileStorage";
import {FileType, getResultViewOption} from "@/components/dataTypes/FileType";
import {HighlightProvider} from "@/contexts/HighlightTracelinksContextType";
import {ResultDisplay} from "@/components/traceLinksResultViewer/ResultDisplay";
import {getTraceLinkTypeByName, TraceLinkTypes} from "@/components/dataTypes/TraceLinkTypes";
import {ErrorDisplay} from "@/app/view/[id]/page";
import {useNavigation} from "@/contexts/NavigationContext";
import {InconsistencyProvider} from "@/contexts/HighlightInconsistencyContext";
import {Inconsistency} from "@/components/traceLinksResultViewer/views/inconsistencies/dataModel/Inconsistency";
import {
    parseInconsistenciesFromJSON
} from "@/components/traceLinksResultViewer/views/inconsistencies/parser/InconsistencyParser";

export default function ViewProvided() {
    const {id} = useParams<{ id: string }>();

    const [traceLinks, setTraceLinks] = useState<TraceLink[]>([]);
    const [inconsistencies, setInconsistencies] = useState<Inconsistency[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [traceLinkType, setTraceLinkType] = useState<any>(TraceLinkTypes.SAD_SAM_CODE); // Default type
    const [uploadedFileTypes, setUploadedFileTypes] = useState<FileType[]>([]);
    const { setCurrentProjectId } = useNavigation();

    const [findInconsistencies, setFindInconsistencies] = useState(false);
    const [findTraceLinks, setFindTraceLinks] = useState(false);
    const uriDecodedId = decodeURIComponent(id);

    useEffect(() => {
        if (!id) {
            console.log("ID is not provided, skipping loading of project files.");
            return;
        }

        async function loadModel() {
            setLoading(true);

            // get the uploaded file types from the metadata
            const uploadedFileTypes1 = await loadProjectMetaData(id);
            setUploadedFileTypes(uploadedFileTypes1);
            setFindInconsistencies(uploadedFileTypes1.includes(FileType.Inconsistencies_JSON));
            setFindTraceLinks(uploadedFileTypes1.includes(FileType.Trace_Link_JSON));
            setError(null);
            try {
                // Ensure loadProjectFile is only called client-side
                if (typeof window !== "undefined") {
                    if (uploadedFileTypes1.includes(FileType.Inconsistencies_JSON)) {
                        // parse file with provided inconsistencies
                        const inconsistenciesFile = await loadProjectFile(id, FileType.Inconsistencies_JSON, false);
                        if (inconsistenciesFile) {
                            const inconsistenciesJson = JSON.parse(inconsistenciesFile.content);
                            setInconsistencies(parseInconsistenciesFromJSON(inconsistenciesJson.inconsistencies));
                        } else {
                            console.warn("No inconsistencies file found for ID:", id);
                            setInconsistencies([]);
                        }
                    }

                    if (uploadedFileTypes1.includes(FileType.Trace_Link_JSON)) {
                        // parse file with provided traceLinks
                        const result = await loadProjectFile(id, FileType.Trace_Link_JSON, false);
                        if (result) {
                            const rawJson = JSON.parse(result.content);
                            setTraceLinks(parseTraceLinksFromJSON(rawJson.traceLinkType, rawJson.traceLinks));
                            setTraceLinkType(getTraceLinkTypeByName(rawJson.traceLinkType) ?? TraceLinkTypes.SAD_SAM_CODE);
                        } else {
                            console.warn("No project file found for ID:", id);
                            setTraceLinks([]);
                            return;
                        }
                    }

                } else {
                    console.log("loadModel called on server, skipping ClientFileStorage.");
                }
            } catch (e: any) {
                console.warn("Failed to load or parse provided traceLinks:", e);
                setError(`Failed to load or parse provided traceLinks: ${e.message}`);
                setTraceLinks([]);
            } finally {
                setLoading(false);
            }
        }
        loadModel();

    }, [id]);

    useEffect(() => {
        setCurrentProjectId(uriDecodedId);

        // Clear the project ID when the component unmounts (navigates away)
        return () => {
            setCurrentProjectId(null);
        };
    }, [uriDecodedId, setCurrentProjectId]);

    return (
        <>
            {error && <ErrorDisplay message={error} onRetry={() => {
            }} retryAllowed={false}/>}
            <HighlightProvider traceLinks={traceLinks} useTraceLinks={findTraceLinks} loading={loading}>
                <InconsistencyProvider inconsistencies={inconsistencies} useInconsistencies={findInconsistencies} loading={loading}>
                    <ResultDisplay
                        id={uriDecodedId}
                        traceLinkType={traceLinkType}
                        displayOptions={uploadedFileTypes.map(filetype => getResultViewOption(filetype))}
                    />
                </InconsistencyProvider>
            </HighlightProvider>
        </>
    );
}