'use client'

import React, {useEffect, useState} from "react";
import {FileType} from "@/components/dataTypes/FileType";
import {parseACMFile} from "@/components/traceLinksResultViewer/views/codeModel/parser/ACMParser";
import {CodeModelUnit} from "@/components/traceLinksResultViewer/views/codeModel/dataModel/ACMDataModel";
import ACMViewer from "@/components/traceLinksResultViewer/views/codeModel/viewer/ACMViewer";
import TooltipInstruction from "@/components/traceLinksResultViewer/TooltipInstruction";
import {loadProjectFile} from "@/util/ClientFileStorage";
import ViewProps from "@/components/traceLinksResultViewer/views/ViewProps";
import LoadingMessage, {ErrorMessage} from "@/components/traceLinksResultViewer/Loading";

export default function DisplayCodeModel({id}: ViewProps) {
    const [fileContent, setFileContent] = useState<string | null>();
    const [codeModel, setCodeModel] = useState<CodeModelUnit | any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState<boolean>(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);


    useEffect(() => {
        // Only run loadModel if the component has mounted on the client
        if (!isMounted || !id) {
            if (id) setIsLoading(false);
            return;
        }

        async function loadModel() {
            setIsLoading(true);
            setError(null);
            try {
                // Ensure loadProjectFile is only called client-side
                if (typeof window !== "undefined" && !codeModel) {
                    const result = await loadProjectFile(id, FileType.Code_Model, false);

                    if (!result) {
                        console.warn(`No code model file found for ID: ${id}`);
                        setError(`No code model file found for ID: ${id}`);
                        setCodeModel(null);
                        setFileContent(null);
                        setIsLoading(false);
                        return;
                    }

                    setFileContent(result.content); // Keep for potential raw display if parsing fails

                    // init code model
                    if (result.content) {
                        const parsedCodeModel2 = parseACMFile(result.content);
                        setCodeModel(parsedCodeModel2);
                    } else {
                        console.warn("loadModel called on server, skipping ClientFileStorage.");
                        setError(`An error loading the code model occurred.`);
                    }
                }
            } catch (e: any) {
                setError(`Failed to load or parse the code model: ${e.message}`);
                setCodeModel(null);
            } finally {
                setIsLoading(false);
            }
        }

        loadModel();
    }, [id, isMounted]);


    if (!isMounted || isLoading) {
        return <LoadingMessage title="Loading code model..." />;
    }

    if (error) {
        return <ErrorMessage error={error}/>;
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
                    {keyCombo: "Click", description: "Find traceLinks"},
                    {keyCombo: "Ctrl + Click", description: "Collapse/Expand node"},
                ]}
            />
        </div>

    );
}