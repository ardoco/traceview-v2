'use client';

import {useParams, useSearchParams} from "next/navigation";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {ResultDisplay} from "@/components/traceLinksResultViewer/ResultDisplay";
import {getTraceLinkTypeByName, TraceLinkTypes} from "@/components/dataTypes/TraceLinkTypes";
import {HighlightProvider} from "@/contexts/HighlightTracelinksContextType";
import {parseTraceLinksFromJSON, RawTraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/parser/TraceLinkParser";
import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";
import {useApiAddressContext} from "@/contexts/ApiAddressContext";
import {useNavigation} from "@/contexts/NavigationContext";
import LoadingErrorModal from "@/components/LoadingErrorModal";
import {Inconsistency} from "@/components/traceLinksResultViewer/views/inconsistencies/dataModel/Inconsistency";
import {
    parseInconsistenciesFromJSON,
    RawInconsistency
} from "@/components/traceLinksResultViewer/views/inconsistencies/parser/InconsistencyParser";
import {DisplayOption} from "@/components/dataTypes/DisplayOption";
import {InconsistencyProvider} from "@/contexts/HighlightInconsistencyContext";
import {loadInconsistencyRequestId} from "@/util/ClientFileStorage";

interface PollResponse {
    status: string;
    message?: string;
    traceLinkType: string;
    result: {
        traceLinks?: RawTraceLink[];
        inconsistencies?: RawInconsistency[];
    };
}

const errorMessage = (err: unknown): string | undefined => err instanceof Error ? err.message : undefined;
const isAbortError = (err: unknown): boolean => err instanceof Error && err.name === 'AbortError';

// Utility function for polling the API
const pollForResult = async (apiAddress: string, id: string, signal: AbortSignal, maxSeconds: number = 240, intervalSeconds: number = 5): Promise<PollResponse> => {
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

        const data: PollResponse = await response.json();
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
    const {setCurrentProjectId} = useNavigation();

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
    // The outcome is tagged with the request it belongs to, so that "loading" and the error are derived during render.
    const [separateOutcome, setSeparateOutcome] = useState<{
        key: string;
        inconsistencies: Inconsistency[];
        error: string | null;
    } | null>(null);

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
    }, [traceLinkType.resultViewOptions, showInconsistencies]);

    const separateRequestId = inconsistencySource?.kind === "separate" ? inconsistencySource.requestId : null;
    const separateKey = apiAddress && separateRequestId ? `${apiAddress}|${separateRequestId}` : null;
    const separateInconsistencies = separateOutcome?.inconsistencies ?? [];
    const separateLoading = separateKey !== null && separateOutcome?.key !== separateKey;
    const separateError = separateOutcome?.key === separateKey ? separateOutcome.error : null;

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

    const fetchResult = useCallback(async (signal: AbortSignal) => {
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

        } catch (err) {
            if (!isAbortError(err)) {
                setError(errorMessage(err) || "An unexpected error occurred.");
            }
        } finally {
            // a superseded (aborted) run must not touch the state of the run that replaced it
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, [apiAddress, id]);

    const handleRetry = () => {
        setError(null);
        const controller = new AbortController();
        fetchResult(controller.signal);
    };

    const handleViewFiles = () => {
        setError(null);
        setLoading(false);
    };

    // Fetch & initialize data when component mounts
    useEffect(() => {
        const controller = new AbortController();
        fetchResult(controller.signal);
        return () => controller.abort();
    }, [fetchResult]);

    // Without URL parameter, use the inconsistency run stored with the project (if any)
    useEffect(() => {
        if (inconsistencySource !== null) return;
        loadInconsistencyRequestId(uriDecodedId)
            .then((requestId) => setInconsistencySource(toInconsistencySource(requestId, uriDecodedId)));
    }, [inconsistencySource, uriDecodedId]);

    // The separate inconsistency run is fetched at the same time as the trace links.
    // Only its inconsistencies are used. Its SAD-SAM trace links are ignored.
    useEffect(() => {
        if (!apiAddress || !separateRequestId || !separateKey) return;
        const controller = new AbortController();
        const signal = controller.signal;

        (async () => {
            try {
                const response = await pollForResult(apiAddress, encodeURIComponent(separateRequestId), signal, 240);
                const parsed = parseInconsistenciesFromJSON(response.result.inconsistencies ?? []);
                if (!signal.aborted) {
                    setSeparateOutcome({key: separateKey, inconsistencies: parsed, error: null});
                }
            } catch (err) {
                if (!isAbortError(err) && !signal.aborted) {
                    setSeparateOutcome((prev) => ({
                        key: separateKey,
                        inconsistencies: prev?.inconsistencies ?? [],
                        error: errorMessage(err) || "The inconsistency detection failed.",
                    }));
                }
            }
        })();

        return () => controller.abort();
    }, [apiAddress, separateRequestId, separateKey]);

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

