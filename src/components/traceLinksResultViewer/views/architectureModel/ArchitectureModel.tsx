'use client'

import React, {useEffect, useState} from "react";
import {FileType} from "@/components/dataTypes/FileType";
import parseUMLModel from "@/components/traceLinksResultViewer/views/architectureModel/parser/UMLParser";
import UMLViewer from "@/components/traceLinksResultViewer/views/architectureModel/viewer/UMLViewer";
import TooltipInstruction from "@/components/traceLinksResultViewer/TooltipInstruction";
import {parsePCM} from "@/components/traceLinksResultViewer/views/architectureModel/parser/PCMParser";
import {AbstractComponent, Edge} from "@/components/traceLinksResultViewer/views/architectureModel/dataModel/ArchitectureDataModel";
import {deleteProjectFile, loadProjectFile} from "@/util/ClientFileStorage";
import ViewProps from "@/components/traceLinksResultViewer/views/ViewProps";

export default function DisplayArchitectureModel({id}: ViewProps) {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [architectureModel, setArchitectureModel] = useState<{ components: AbstractComponent[], edges: Edge[] } | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true); // Added loading state
    const [error, setError] = useState<string | null>(null); // Added error state
    const [isMounted, setIsMounted] = useState<boolean>(false); // Track if component has mounted

    useEffect(() => {
        setIsMounted(true); // Set to true once component mounts on client
    }, []);

    useEffect(() => {
        // Only run loadModel if the component has mounted on the client
        if (!isMounted || !id) {
            if (id) setIsLoading(false); // If no id, or not mounted, stop loading if id was present
            return;
        }

        async function loadModel() {
            setIsLoading(true);
            setError(null);
            try {
                // Ensure loadProjectFile is only called client-side
                if (typeof window !== "undefined" && !architectureModel) {
                    const result = await loadProjectFile(id, FileType.Architecture_Model_UML, false);

                    if (!result) {
                        console.warn("No project file found for ID:", id);
                        setArchitectureModel(null);
                        setFileContent(null);
                        setIsLoading(false);
                        return;
                    }

                    setFileContent(result.content); // Keep for potential raw display if parsing fails

                    let parsedModel = null;
                    switch (result.fileType) {
                        case FileType.Architecture_Model_UML:
                            parsedModel = parseUMLModel(result.content);
                            break;
                        case FileType.Architecture_Model_PCM:
                            parsedModel = parsePCM(result.content);
                            break;
                        default:
                            console.warn("Unknown architecture model file type:", result.fileType);
                            setError(`Unknown architecture model file type: ${result.fileType}`);
                    }
                    setArchitectureModel(parsedModel);
                } else {
                    // This case should ideally not be hit if isMounted is true,
                    // but as a safeguard:
                    console.warn("loadModel called on server, skipping ClientFileStorage.");
                }
            } catch (e: any) {
                console.error("Failed to load or parse architecture model:", e);
                setError(`Failed to load model: ${e.message}`);
                setArchitectureModel(null);
            } finally {
                setIsLoading(false);
            }
        }
        loadModel();
    }, [id, isMounted]); // Rerun when id or isMounted changes


    // Initial render (server and first client render before useEffect runs)
    // should be consistent. If not mounted, or loading, show a placeholder.
    if (!isMounted || isLoading) {
        return <div className="flex justify-center items-center h-full">Loading architecture model...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    return (
        <div className="relative w-full h-full" style={{height: "calc(100% - 40px)"}}>
            {architectureModel ? (
                <UMLViewer umlComponents={architectureModel.components} umlEdges={architectureModel.edges}/>
            ) : (
                // Display raw file content or a "not found" message if model is null but not loading and no error
                <div className="whitespace-pre p-4">
                    {fileContent ? `Could not parse model. Raw content:\n\n${fileContent}` : "Architecture model not found or could not be loaded."}
                </div>
            )}

            <TooltipInstruction
                title="Instructions"
                instructions={[
                    { keyCombo: "Click", description: "Highlight traceLinks" },
                    { keyCombo: "Hover over interface's name", description: "display details" },
                ]}
            />
        </div>
    );
}
