'use client';

import {useParams, useSearchParams} from "next/navigation";
import React, {useEffect, useState} from "react";
import {ResultDisplay} from "@/components/traceLinksResultViewer/ResultDisplay";
import {TraceLinkTypes} from "@/components/dataTypes/TraceLinkTypes";
import Button from "@/components/Button";
import {HighlightProvider} from "@/contexts/HighlightContextType";
import {parseTraceLinksFromJSON} from "@/components/traceLinksResultViewer/views/tracelinks/parser/TraceLinkParser";
import {TraceLink} from "@/components/traceLinksResultViewer/views/tracelinks/dataModel/TraceLink";
import {useApiAddressContext} from "@/contexts/ApiAddressContext";

// Utility function for polling the API
const pollForResult = async (apiAddress:string, id: string, maxSeconds: number = 240, intervalSeconds: number = 5): Promise<any> => {
    let elapsedSeconds = 0;

    while (elapsedSeconds < maxSeconds) {
        try {
            const response = await fetch(`/api/get-result/${id}`, {
                    method: "GET",
                    headers: {
                        'X-Target-API': apiAddress,
                    },
            });

            const data = await response.json();
            if (data.status === "OK") {
                return data; // Stop polling if we have valid result
            } else if (data.status !== "ACCEPTED") {
                console.error(`Polling failed with HTTP ${response.status}`);
                throw new Error(data.message || "An unexpected error occurred.");
            }

            console.log(`Polling... waiting for result (${elapsedSeconds}s elapsed)`);
            await new Promise((resolve) => setTimeout(resolve, intervalSeconds * 1000)); // Wait before next attempt
            elapsedSeconds += intervalSeconds;
        } catch (error) {
            console.error("Polling encountered an error:", error);
            throw new Error("An error occurred while polling the result.");
        }
    }
    throw new Error("The result is still processing. Please try again.");
};

// Main Component
export default function NewUploadProject() {
    const {id} = useParams<{ id: string }>(); // Get the `id` from the path
    const searchParams = useSearchParams();
    const type = searchParams.get("type"); // Get the `type` from the query params

    const {apiAddress} = useApiAddressContext();
    const [loading, setLoading] = useState(true);
    const [traceLinks, setTraceLinks] = useState<TraceLink[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [retryAllowed, setRetryAllowed] = useState(false);

    const traceLinkType = TraceLinkTypes[type || "SAD_SAM_CODE"] ?? TraceLinkTypes["SAD_SAM_CODE"];
    const uriDecodedId = decodeURIComponent(id);

    const fetchResult = async () => {
        if (!apiAddress) return;
        setLoading(true);
        setError(null);
        setRetryAllowed(false);

        try {
            const response = await pollForResult(apiAddress, id, 240); // Poll for up to 4 minutes
            const parsedTraceLinks = parseTraceLinksFromJSON(response);
            setTraceLinks(parsedTraceLinks);

        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
            setRetryAllowed(true);
        } finally {
            setLoading(false);
        }
    };

    // Fetch & initialize data when component mounts
    useEffect(() => {
        fetchResult();
    }, [id, apiAddress]);

    return (
        <>
            {loading && <LoadingBanner/>}
            {error && <ErrorDisplay message={error} onRetry={fetchResult} retryAllowed={retryAllowed}/>}
            <HighlightProvider traceLinks={traceLinks}>
                <ResultDisplay id={uriDecodedId} traceLinkType={traceLinkType} displayOptions={traceLinkType.resultViewOptions}/>
            </HighlightProvider>
        </>
    );
}


// Loading Banner
function LoadingBanner() {
    return (
        <div className="w-full bg-gray-100 text-gray-700 p-3 text-center font-semibold border-gray-300 animate-fade-in">
            Generating Trace-Links, please wait...
        </div>
    );
}

export function ErrorDisplay({message, onRetry, retryAllowed}: {
    message: string;
    onRetry: () => void;
    retryAllowed: boolean
}) {
    return (
        <div className="w-full bg-gray-100 text-gray-700 p-3 text-center font-semibold border-gray-300 animate-fade-in">
            {message}
            {retryAllowed && (
                <Button
                    text="Retry"
                    onButtonClicked={onRetry}
                    disabled={false}
                />
            )}
        </div>
    );
}

