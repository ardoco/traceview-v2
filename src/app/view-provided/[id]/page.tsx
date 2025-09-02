'use client';
import {useParams} from "next/navigation";
import React, {useEffect, useState} from "react";
import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";
import {parseTraceLinksFromJSON} from "@/components/traceLinksResultViewer/views/tracelinks/parser/TraceLinkParser";
import {loadProjectFile, loadProjectMetaData} from "@/util/ClientFileStorage";
import {FileType} from "@/components/dataTypes/FileType";
import {HighlightProvider} from "@/contexts/HighlightTracelinksContextType";
import {ResultDisplay} from "@/components/traceLinksResultViewer/ResultDisplay";
import {getTraceLinkTypeByName, TraceLinkType, TraceLinkTypes} from "@/components/dataTypes/TraceLinkTypes";
import {ErrorDisplay} from "@/app/view/[id]/page";
import {useNavigation} from "@/contexts/NavigationContext";
import {InconsistencyProvider} from "@/contexts/HighlightInconsistencyContext";
import {Inconsistency} from "@/components/traceLinksResultViewer/views/inconsistencies/dataModel/Inconsistency";
import {
    parseInconsistenciesFromJSON
} from "@/components/traceLinksResultViewer/views/inconsistencies/parser/InconsistencyParser";
import {getResultViewOption} from "@/components/dataTypes/DisplayOption";

interface TraceLinkResult {
    traceLinkType: TraceLinkType;
    traceLinks: TraceLink[];
}

export default function ViewProvided() {
    const {id} = useParams<{ id: string }>();
    const uriDecodedId = decodeURIComponent(id);
    const {setCurrentProjectId} = useNavigation();

    const [traceLinks, setTraceLinks] = useState<TraceLink[]>([]);
    const [inconsistencies, setInconsistencies] = useState<Inconsistency[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setIsLoading] = useState<boolean>(true);

    const [traceLinkType, setTraceLinkType] = useState<any>(TraceLinkTypes.SAD_SAM_CODE);
    const [uploadedFileTypes, setUploadedFileTypes] = useState<FileType[]>([]);


    const loadTraceLinks = async (fileId: string): Promise<TraceLinkResult> => {
        const result = await loadProjectFile(fileId, FileType.TRACELINKS);
        let data: TraceLink[] = [];
        let traceLinkType = TraceLinkTypes.SAD_SAM_CODE;

        if (result?.content) {
            try {
                const rawJson = JSON.parse(result.content);
                data = parseTraceLinksFromJSON(rawJson.traceLinkType, rawJson.traceLinks)
                traceLinkType = getTraceLinkTypeByName(rawJson.traceLinkType) || TraceLinkTypes.SAD_SAM_CODE;

            } catch (e: any) {
                console.error("Failed to parse trace links:", e);
                throw new Error("Failed to parse the trace links. The file might be corrupted or in an invalid format.");
            }
        }
        return {traceLinks: data, traceLinkType: traceLinkType};
    };

    const loadInconsistencies = async (fileId: string): Promise<Inconsistency[]> => {
        const result = await loadProjectFile(fileId, FileType.INCONSISTENCIES);
        let data: Inconsistency[] = [];

        if (result?.content) {
            try {
                const inconsistenciesJson = JSON.parse(result?.content);
                data = parseInconsistenciesFromJSON(inconsistenciesJson.inconsistencies);
            } catch (e: any) {
                console.error("Failed to parse inconsistencies:", e);
                throw new Error("Failed to parse the inconsistencies. The file might be corrupted or in an invalid format.");
            }
        }
        return data;
    };

    useEffect(() => {
        if (!id) {
            console.warn("ID is not provided, skipping loading of project files.");
            return;
        }

        const fetchAllData = async () => {
            setIsLoading(true);
            setError(null);
            const uploadedFileTypes1 = await loadProjectMetaData(id);
            setUploadedFileTypes(uploadedFileTypes1);

            try {
                if (uploadedFileTypes1.includes(FileType.TRACELINKS)) {
                    const result = await loadTraceLinks(uriDecodedId);
                    setTraceLinks(result.traceLinks);
                    setTraceLinkType(result.traceLinkType);
                }

                if (uploadedFileTypes1.includes(FileType.INCONSISTENCIES)) {
                    const result = await loadInconsistencies(uriDecodedId);
                    setInconsistencies(result);
                }
            } catch (e: any) {
                setError(`Failed to load data: ${e.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();

    }, [id, uriDecodedId]);

    useEffect(() => {
        setCurrentProjectId(uriDecodedId);
        // return () => setCurrentProjectId(null);
    }, [uriDecodedId, setCurrentProjectId]);


    return (
        <>
            {error && <ErrorDisplay message={error} onRetry={() => {
            }} retryAllowed={false}/>}
            <HighlightProvider traceLinks={traceLinks} traceLinkType={traceLinkType} loading={loading}>
                <InconsistencyProvider inconsistencies={inconsistencies} loading={loading}>
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