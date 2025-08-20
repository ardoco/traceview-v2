'use client';

import {useParams, useSearchParams} from "next/navigation";
import React, {useEffect, useMemo, useState} from "react";
import {ResultDisplay} from "@/components/traceLinksResultViewer/ResultDisplay";
import {getTraceLinkTypeByName, TraceLinkTypes} from "@/components/dataTypes/TraceLinkTypes";
import Button from "@/components/Button";
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
import {ResultPanelType} from "@/components/dataTypes/ResultPanelType";
import {InconsistencyProvider} from "@/contexts/HighlightInconsistencyContext";

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
            throw new Error("An error occurred while running the pipeline in ArDoCo: \n" + data.message);
        }

        // Keep polling
        await new Promise((resolve) => setTimeout(resolve, intervalSeconds * 1000));
        elapsedSeconds += intervalSeconds;
    }
    throw new Error("The result is still processing. Please try again later.");
};

// Main Component
export default function NewUploadProject() {
    const {id} = useParams<{ id: string }>();
    const searchParams = useSearchParams();
    const type = searchParams.get("type");
    const findInconsistencies = searchParams.get("inconsistencies") === 'true';
    const {setCurrentProjectId, controller} = useNavigation();

    const {apiAddress} = useApiAddressContext();
    const [loading, setLoading] = useState(true);
    const [traceLinks, setTraceLinks] = useState<TraceLink[]>([]);
    const [inconsistencies, setInconsistencies] = useState<Inconsistency[]>([]);
    const [error, setError] = useState<string | null>(null);

    const traceLinkType = getTraceLinkTypeByName(type!) || TraceLinkTypes.SAD_SAM_CODE;
    const uriDecodedId = decodeURIComponent(id);

    const displayOptions = useMemo(() => {
        const options = [...traceLinkType.resultViewOptions];
        options.unshift(ResultPanelType.TraceLinks); // Always show traceLinks first
        if (findInconsistencies) {
            options.push(ResultPanelType.Inconsistencies);
        }
        return options;
    }, []);


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

            // If inconsistencies are present and asked for, parse them as well
            if (findInconsistencies && response.result.inconsistencies) {
                const parsedInconsistencies = parseInconsistenciesFromJSON(response.result.inconsistencies);
                setInconsistencies(parsedInconsistencies);
            }

        } catch (err: any) {
            if (err.name !== 'AbortError') {
                setError(err.message || "An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Fetch & initialize data when component mounts
    useEffect(() => {
        fetchResult(controller.signal);
    }, [id, apiAddress]);

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
                <InconsistencyProvider inconsistencies={inconsistencies} useInconsistencies={findInconsistencies}
                                       loading={loading}>
                    <ResultDisplay id={uriDecodedId} traceLinkType={traceLinkType} displayOptions={displayOptions}/>
                </InconsistencyProvider>
            </HighlightProvider>
        </>
    );
}


function LoadingBanner() {
    return (
        <div className="w-full bg-gray-100 text-gray-700 p-3 text-center font-semibold border-gray-300 animate-fade-in">
            Generating Trace-Links, please wait...
        </div>
    );
}

export function ErrorDisplay({message, onRetry, retryAllowed}: {
    message: string;
    onRetry: (signal: AbortSignal) => void;
    retryAllowed: boolean
}) {
    const {controller} = useNavigation();

    return (
        <div className="w-full bg-gray-100 text-gray-700 p-3 text-center font-semibold border-gray-300 animate-fade-in">
            {message}
            {retryAllowed && (
                <Button
                    text="Retry"
                    onButtonClicked={() => onRetry(controller.signal)}
                    disabled={false}
                />
            )}
        </div>
    );
}