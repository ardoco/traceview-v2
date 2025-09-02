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
import {LoaderResult, useDataLoader} from "@/util/useDataLoader";

export default function DisplayArchitectureModel({id}: ViewProps) {

    const loadArchitectureModel = async (fileId: string): Promise<LoaderResult<{ components: AbstractComponent[], edges: Edge[] }>> => {
        const result = await loadProjectFile(fileId, FileType.architectureModelUML);
        const fileContent = result?.content || null;
        let data = null;

        if (result && fileContent) {
            try {
                if (result.fileType === FileType.architectureModelPCM) {
                    data = parsePCM(fileContent);
                } else if (result.fileType === FileType.architectureModelUML) {
                    data = parseUMLModel(fileContent);
                } else {
                    throw new Error("Unknown architecture file type.");
                }
            } catch (e: any) {
                console.error("Failed to parse architecture model:", e);
                throw new Error("Failed to parse the architecture model. The file might be corrupted or in an invalid format.");
            }
        }
        return {data, fileContent};
    }

    const {data: architectureModel, fileContent, isLoading, error} = useDataLoader<{ components: AbstractComponent[], edges: Edge[] }>(id, loadArchitectureModel);


    if (isLoading) {
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
