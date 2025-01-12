'use client';

import LoadingScreen from "@/components/LoadingScreen";
import {useParams} from "next/navigation";
import React, {useEffect, useState, useCallback} from "react";
import MultiColumnView from "@/components/MultiColumnView";
import {Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";

// Utility function for polling the API
const pollForResult = async (id: string, maxRetries: number): Promise<any> => {
    for (let i = 0; i < maxRetries; i++) {
        const response = await fetch(`/api/wait-for-result/${id}`).then((res) => res.json());
        if (response.status !== "202 Accepted") {
            return response;
        }
    }
    throw new Error("The result is still processing. Click the button to continue waiting.");
};

// Main Component
export default function NewUploadProject() {
    const {id, type} = useParams<{ id: string; type: string }>();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchResult = useCallback(async () => {
        try {
            // Initial fetch for the result
            let response = await fetch(`/api/get-result/${id}`).then((res) => res.json());

            // If the result is still being processed, start polling
            if (response.status === "ACCEPTED") {
                response = await pollForResult(id, 5); // Poll up to 5 times (=5 * 60 seconds accoring to the API)
            }

            // Handle final response
            if (response.status === "ACCEPTED") {
                console.log(response)
                throw new Error(response.message || "The result is still processing and it took too long. TODO to continue waiting for the result.");

            } else if (response.status !== "OK") {
                console.log(response)
                throw new Error(response.message || "An error occurred while fetching the result.");
            }

            setResult(response);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Fetch the result when the component mounts
    useEffect(() => {
        fetchResult();
    }, [fetchResult]);

    // Render states
    if (loading) return <LoadingScreen/>;
    if (error) return <ErrorDisplay message={error} onRetry={fetchResult}/>;
    if (!result) return <p>No data available.</p>;

    return (
        <ResultDisplay result={result}/>
    );
}

// Error Display Component
function ErrorDisplay({message, onRetry}: { message: string; onRetry: () => void }) {
    return (
        <div className="error-container">
            <p>Error: {message}</p>
            <button onClick={onRetry} className="retry-button">
                Retry
            </button>
        </div>
    );
}

// Result Display Component
function ResultDisplay({result}: { result: any }) {
    return (
        <div className="bg-white z-1 relative h-full">
            <PanelGroup direction="horizontal" className="h-full">
                <Panel minSize={10} className="h-full overflow-y-auto" style={{overflowY: "auto", overflowX: "auto"}}>
                    <h2>Result Details:</h2>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </Panel>
                <PanelResizeHandle className="w-1 bg-black"/>
                <Panel minSize={10} className="h-full overflow-y-auto">
                    <h2>Post Details:</h2>
                    <p><strong>Title:</strong> {result.title}</p>
                    <p><strong>Body:</strong> {result.body}</p>
                </Panel>
                <PanelResizeHandle className="w-1 bg-black"/>
                <Panel minSize={10} className="h-full overflow-y-auto" collapsible collapsedSize={0}>
                    <h2>Post Details:</h2>
                    <p><strong>Title:</strong> {result.title}</p>
                    <p><strong>Body:</strong> {result.body}</p>
                </Panel>
            </PanelGroup>
        </div>
    );
}


