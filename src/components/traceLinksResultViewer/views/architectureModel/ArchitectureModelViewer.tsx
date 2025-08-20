'use client'

import React, {useEffect, useState} from "react";
import {FileType} from "@/components/dataTypes/FileType";
import parseUMLModel from "@/components/traceLinksResultViewer/views/architectureModel/parser/UMLParser";
import UMLViewer from "@/components/traceLinksResultViewer/views/architectureModel/viewer/UMLViewer";
import TooltipInstruction from "@/components/traceLinksResultViewer/TooltipInstruction";
import {parsePCM} from "@/components/traceLinksResultViewer/views/architectureModel/parser/PCMParser";
import {
    AbstractComponent,
    Edge
} from "@/components/traceLinksResultViewer/views/architectureModel/dataModel/ArchitectureDataModel";
import {loadProjectFile} from "@/util/ClientFileStorage";
import ViewProps from "@/components/traceLinksResultViewer/views/ViewProps";
import LoadingMessage, {ErrorMessage} from "@/components/traceLinksResultViewer/Loading";

export default function DisplayArchitectureModel({id}: ViewProps) {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [architectureModel, setArchitectureModel] = useState<{
        components: AbstractComponent[],
        edges: Edge[]
    } | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState<boolean>(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || !id) {
            if (id) setIsLoading(false);
            return;
        }

        async function loadModel() {
            setIsLoading(true);
            setError(null);
            try {
                if (typeof window !== "undefined" && !architectureModel) {
                    const result = await loadProjectFile(id, FileType.Architecture_Model_UML, false);

                    if (!result) {
                        console.warn(`No architecture model file found for ID: ${id}`);
                        setError(`No architecture model file found for ID: ${id}`);
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
                    console.warn("loadModel called on server, skipping ClientFileStorage.");
                }
            } catch (e: any) {
                setError(`Failed to load or parse architecture model: ${e.message}`);
                setArchitectureModel(null);
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
        <div className="relative w-full h-full" style={{height: "calc(100% - 40px)"}}>
            {architectureModel ? (
                <UMLViewer umlComponents={architectureModel.components} umlEdges={architectureModel.edges}/>
            ) : (
                 <div className="whitespace-pre p-4">
                    {fileContent ? `Could not parse model. Raw content:\n\n${fileContent}` : "Architecture model not found or could not be loaded."}
                </div>
            )}

            <TooltipInstruction
                title="Instructions"
                instructions={[
                    {keyCombo: "Click", description: "Highlight traceLinks"},
                    {keyCombo: "Hover over interface's name", description: "display details"},
                ]}
            />
        </div>
    );
}
