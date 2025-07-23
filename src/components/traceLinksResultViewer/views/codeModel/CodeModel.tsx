'use client'

import React, { useEffect, useState } from "react";
import {FileType} from "@/components/dataTypes/FileType";
import {parseACMFile} from "@/components/traceLinksResultViewer/views/codeModel/parser/ACMParser";
import {CodeModelUnit} from "@/components/traceLinksResultViewer/views/codeModel/dataModel/ACMDataModel";
import ACMViewer from "@/components/traceLinksResultViewer/views/codeModel/viewer/ACMViewer";
import TooltipInstruction from "@/components/traceLinksResultViewer/TooltipInstruction";
import {deleteProjectFile, loadProjectFile} from "@/util/ClientFileStorage";
import ViewProps from "@/components/traceLinksResultViewer/views/ViewProps";

export default function DisplayCodeModel({id}: ViewProps) {
    const [fileContent, setFileContent] = useState<string | null>();
    const [codeModel, setCodeModel] = useState<CodeModelUnit | any>(null);
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
                if (typeof window !== "undefined" && !codeModel) {
                    const result = await loadProjectFile(id, FileType.Code_Model, true);

                    if (!result) {
                        console.warn("No project file found for ID:", id);
                        setCodeModel(null);
                        setFileContent(null);
                        setIsLoading(false);
                        return;
                    }

                    setFileContent(result.content); // Keep for potential raw display if parsing fails

                    // init code model
                    if (result.content) {
                        //const parsedCodeModel2 = parseCodeFromACM(text);
                        const parsedCodeModel2 = parseACMFile(result.content);
                        setCodeModel(parsedCodeModel2);
                    }
                 else {
                        // This case should ideally not be hit if isMounted is true,
                        // but as a safeguard:
                        console.warn("loadModel called on server, skipping ClientFileStorage.");}
                    // Clean up the file after loading
                    //await deleteProjectFile(id, FileType.Code_Model);
                }
            } catch (e: any) {
                console.error("Failed to load or parse architecture model:", e);
                setError(`Failed to load model: ${e.message}`);
                setCodeModel(null);
            } finally {
                setIsLoading(false);
            }
        }
        loadModel();
    }, [id, isMounted]);


    // Initial render (server and first client render before useEffect runs)
    // should be consistent. If not mounted, or loading, show a placeholder.
    if (!isMounted || isLoading) {
        return <div className="flex justify-center items-center h-full">Loading code model...</div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">Error: {error}</div>;
    }

    return (

        <div className=" relative w-full" style={{height: "calc(100% - 40px)"}}>

            {codeModel ? (
                <ACMViewer codeModel={codeModel}/>

            ) : (
                <div className="whitespace-pre">
                    {fileContent}
                </div>
            )}

            <TooltipInstruction
                title="Instructions"
                instructions={[
                    { keyCombo: "Click", description: "Highlight path to root" },
                    { keyCombo: "Ctrl + Click", description: "Collapse/Expand node" },
                ]}
            />
        </div>

    );
}