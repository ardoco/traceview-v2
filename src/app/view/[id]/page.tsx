'use client';

import LoadingScreen from "@/components/LoadingScreen";
import {useParams, useSearchParams} from "next/navigation";
import React, {useEffect, useState} from "react";
import {ResultDisplay} from "@/components/traceLinksResultViewer/ResultDisplay";
import {TraceLinkTypes} from "@/components/dataTypes/TraceLinkTypes";
import Button from "@/components/Button";
import {HighlightProvider, useHighlightContext} from "@/components/traceLinksResultViewer/util/HighlightContextType";
import {parseTraceLinksFromJSON} from "@/components/traceLinksResultViewer/util/parser/TraceLinkParser";
import {apiResolver} from "next/dist/server/api-utils/node/api-resolver";
import {TraceLink} from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/TraceLink";

// Utility function for polling the API
const pollForResult = async (id: string, maxSeconds: number = 240, intervalSeconds: number = 5): Promise<any> => {
    let elapsedSeconds = 0;

    while (elapsedSeconds < maxSeconds) {
        try {
            const response = await fetch(`/api/get-result/${id}`);

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
// Main Component
export default function NewUploadProject() {
    const {id} = useParams<{ id: string }>(); // Get the `id` from the path
    const searchParams = useSearchParams();
    const type = searchParams.get("type"); // Get the `type` from the query params

    const [loading, setLoading] = useState(true);
    const [traceLinks, setTraceLinks] = useState<TraceLink[]>([]);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [retryAllowed, setRetryAllowed] = useState(false);


    const traceLinkType = TraceLinkTypes[type || "SAD-SAM-Code"] ?? TraceLinkTypes["SAD-SAM-Code"];
    const uriDecodedId = decodeURIComponent(id);

    const fetchResult = async () => {
        setLoading(true);
        setError(null);
        setRetryAllowed(false);

        try {
            const response = await pollForResult(id, 240); // Poll for up to 4 minutes
            setResult(response);
            const parsedTraceLinks = parseTraceLinksFromJSON(response);
            setTraceLinks(parsedTraceLinks); // Step 2: Store in context
            console.log("Parsed Trace Links:", parsedTraceLinks);


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
    }, [id]);

    return (
        <>
            {loading && <LoadingBanner/>}
            {error && <ErrorDisplay message={error} onRetry={fetchResult} retryAllowed={retryAllowed}/>}
            <HighlightProvider traceLinks={traceLinks}>
                <ResultDisplay result={result} id={uriDecodedId} traceLinkType={traceLinkType}/>
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


function ErrorDisplay({message, onRetry, retryAllowed}: {
    message: string;
    onRetry: () => void;
    retryAllowed: boolean
}) {
    return (
        <div className="relative bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center w-80">
                <p className="text-red-600 font-bold text-lg">Error</p>
                <p className="text-gray-700 mt-2">{message}</p>
                {retryAllowed && (
                    <Button
                        text="Retry"
                        onButtonClicked={onRetry}
                        disabled={false}
                    />
                )}
            </div>
        </div>
    );
}

