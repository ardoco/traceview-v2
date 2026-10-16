'use client';

import {useParams, useSearchParams} from "next/navigation";
import React, {useEffect, useMemo, useState} from "react";
import {ResultDisplay} from "@/components/traceLinksResultViewer/ResultDisplay";
import {getTraceLinkTypeByName, TraceLinkTypes} from "@/components/dataTypes/TraceLinkTypes";
import {HighlightProvider} from "@/contexts/HighlightTracelinksContextType";
import {parseTraceLinksFromJSON} from "@/components/traceLinksResultViewer/views/tracelinks/parser/TraceLinkParser";
import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";
import {useApiAddressContext} from "@/contexts/ApiAddressContext";
import {useNavigation} from "@/contexts/NavigationContext";
import LoadingErrorModal from "@/components/LoadingErrorModal";
import {Inconsistency} from "@/components/traceLinksResultViewer/views/inconsistencies/dataModel/Inconsistency";
import {
    parseInconsistenciesFromJSON
} from "@/components/traceLinksResultViewer/views/inconsistencies/parser/InconsistencyParser";
import {DisplayOption} from "@/components/dataTypes/DisplayOption";
import {InconsistencyProvider} from "@/contexts/HighlightInconsistencyContext";
import {loadInconsistencyRequestId} from "@/util/ClientFileStorage";

// Utility function for polling the API
const pollForResult = async (apiAddress: string, id: string, signal: AbortSignal, maxSeconds: number = 240, intervalSeconds: number = 5): Promise<any> => {
    let elapsedSeconds = 0;

    while (elapsedSeconds < maxSeconds) {
        if (signal.aborted) {
            throw new Error("Polling was aborted.");
        }

        const response = await fetch(`/api/get-result/${id}`, {
            method: "GET",
            headers: {
                'X-Target-API': apiAddress,
            },
            signal: signal,
        });

        const data = await response.json();
        if (data.status === "OK") {
            return data;
        } else if (data.status !== "ACCEPTED") {
            // Throw an error with the message from the server
            throw new Error("An error occurred while running the pipeline in ARDoCo: \n" + data.message);
        }

        // Keep polling
        await new Promise((resolve) => setTimeout(resolve, intervalSeconds * 1000));
        elapsedSeconds += intervalSeconds;
    }
    throw new Error("The result is still processing. Please try again later.");
};

/**
 * Where the inconsistencies of this result come from, based on the `inconsistencies` URL parameter:
 * "true" = same run as the trace links (SWATTR), an id = separate inconsistency run,
 * "failed" = the separate run could not be started, "false" = not requested.
 */
type InconsistencySource =
    { kind: "none" } | { kind: "same" } | { kind: "separate", requestId: string } | { kind: "failed" };

function toInconsistencySource(value: string | null | undefined, traceLinkRequestId: string): InconsistencySource {
    if (!value || value === "false") return {kind: "none"};
    if (value === "true" || value === traceLinkRequestId) return {kind: "same"};
    if (value === "failed") return {kind: "failed"};
    return {kind: "separate", requestId: value};
}

// Main Component
export default function NewUploadProject() {
    const {id} = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const type = searchParams.get("type");
    const inconsistenciesParam = searchParams.get("inconsistencies");
    const {setCurrentProjectId, controller} = useNavigation();

    const {apiAddress} = useApiAddressContext();
    const [loading, setLoading] = useState(true);
    const [traceLinks, setTraceLinks] = useState<TraceLink[]>([]);
    const [error, setError] = useState<string | null>(null);

    const traceLinkType = getTraceLinkTypeByName(type!) || TraceLinkTypes.SAD_SAM_CODE;
    const uriDecodedId = decodeURIComponent(id);

    // null until known: without URL parameter, the stored project metadata is checked.
    const [inconsistencySource, setInconsistencySource] = useState<InconsistencySource | null>(
        inconsistenciesParam === null ? null : toInconsistencySource(inconsistenciesParam, uriDecodedId));
    // inconsistencies contained in the trace link result (SWATTR)
    const [sameRunInconsistencies, setSameRunInconsistencies] = useState<Inconsistency[]>([]);
    // inconsistencies of a separate inconsistency run (other trace link types)
    const [separateInconsistencies, setSeparateInconsistencies] = useState<Inconsistency[]>([]);
    const [separateLoading, setSeparateLoading] = useState(false);
    const [separateError, setSeparateError] = useState<string | null>(null);

    const showInconsistencies = inconsistencySource !== null && inconsistencySource.kind !== "none";

    const displayOptions = useMemo(() => {
        const options = [...traceLinkType.resultViewOptions];
        options.unshift(DisplayOption.TRACELINKS); // Always show traceLinks first
        if (showInconsistencies) {
            // inconsistencies refer to the documentation and the architecture model
            for (const option of [DisplayOption.ARCHITECTURE_MODEL, DisplayOption.DOCUMENTATION]) {
                if (!options.includes(option)) {
                    options.push(option);
                }
            }
            options.push(DisplayOption.INCONSISTENCIES);
        }
        return options;
    }, [showInconsistencies]);

    let inconsistencies: Inconsistency[] = [];
    let inconsistenciesLoading = false;
    let inconsistenciesError: string | null = null;
    if (inconsistencySource?.kind === "same") {
        inconsistencies = sameRunInconsistencies;
        inconsistenciesLoading = loading;
    } else if (inconsistencySource?.kind === "separate") {
        inconsistencies = separateInconsistencies;
        inconsistenciesLoading = separateLoading;
        inconsistenciesError = separateError;
    } else if (inconsistencySource?.kind === "failed") {
        inconsistenciesError = "Could not start the inconsistency detection.";
    }

    const handleRetry = () => {
        setError(null);
        const controller = new AbortController();
        fetchResult(controller.signal);
    };

    const handleViewFiles = () => {
        setError(null);
        setLoading(false);
    };

    const fetchResult = async (signal: AbortSignal) => {
        if (!apiAddress) return;
        setLoading(true);
        setError(null);

        try {
            const response = await pollForResult(apiAddress, id, signal, 240); // Poll for up to 4 minutes
            const parsedTraceLinks = parseTraceLinksFromJSON(response.traceLinkType, response.result.traceLinks);
            setTraceLinks(parsedTraceLinks);

            // SWATTR runs with inconsistency detection contain the inconsistencies as well
            if (response.result.inconsistencies) {
                setSameRunInconsistencies(parseInconsistenciesFromJSON(response.result.inconsistencies));
            }

        } catch (err: any) {
            if (err.name !== 'AbortError') {
                setError(err.message || "An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Only the inconsistencies of the separate run are used. Its SAD-SAM trace links are ignored.
    const fetchSeparateInconsistencies = async (requestId: string, signal: AbortSignal) => {
        if (!apiAddress) return;
        setSeparateLoading(true);
        setSeparateError(null);
        try {
            const response = await pollForResult(apiAddress, encodeURIComponent(requestId), signal, 240);
            setSeparateInconsistencies(parseInconsistenciesFromJSON(response.result.inconsistencies ?? []));
        } catch (err: any) {
            if (err.name !== 'AbortError' && !signal.aborted) {
                setSeparateError(err.message || "The inconsistency detection failed.");
            }
        } finally {
            setSeparateLoading(false);
        }
    };

    // Fetch & initialize data when component mounts
    useEffect(() => {
        fetchResult(controller.signal);
    }, [id, apiAddress]);

    // Without URL parameter, use the inconsistency run stored with the project (if any)
    useEffect(() => {
        if (inconsistencySource !== null) return;
        loadInconsistencyRequestId(uriDecodedId)
            .then((requestId) => setInconsistencySource(toInconsistencySource(requestId, uriDecodedId)));
    }, [inconsistencySource, uriDecodedId]);

    // The separate inconsistency run is fetched at the same time as the trace links
    const separateRequestId = inconsistencySource?.kind === "separate" ? inconsistencySource.requestId : null;
    useEffect(() => {
        if (separateRequestId) {
            fetchSeparateInconsistencies(separateRequestId, controller.signal);
        }
    }, [separateRequestId, apiAddress]);

    useEffect(() => {
        setCurrentProjectId(uriDecodedId);

        // Clear the project ID when the component unmounts (navigates away)
        return () => {
            setCurrentProjectId(null);
        };
    }, [uriDecodedId, setCurrentProjectId]);

    return (
        <>
            {loading && <LoadingBanner/>}
            <LoadingErrorModal
                isOpen={!!error}
                message={error || ''}
                onRetry={handleRetry}
                onViewFiles={handleViewFiles}
            />
            <HighlightProvider traceLinks={traceLinks} traceLinkType={traceLinkType} loading={loading}>
                <InconsistencyProvider inconsistencies={inconsistencies} loading={inconsistenciesLoading}
                                       error={inconsistenciesError}>
                    <ResultDisplay id={uriDecodedId} traceLinkType={traceLinkType} displayOptions={displayOptions}/>
                </InconsistencyProvider>
            </HighlightProvider>
        </>
    );
}

function LoadingBanner() {
    return (
        <div className="w-full bg-gray-100 text-gray-700 p-3 text-center font-semibold border-gray-300 animate-fade-in">
            Generating trace links, please wait...
        </div>
    );
}

