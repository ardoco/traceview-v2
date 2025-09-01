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
import {
    parseDocumentationText
} from "@/components/traceLinksResultViewer/views/documentation/parser/DocumentationParser";
import {LoaderResult, useDataLoader} from "@/util/useDataLoader";
import {Sentence} from "@/components/traceLinksResultViewer/views/documentation/dataModel/DocumentationSentence";

export default function DisplayCodeModel({id}: ViewProps) {

    const loadCodeModel = async (fileId: string): Promise<LoaderResult<CodeModelUnit>> => {
        const result = await loadProjectFile(fileId, FileType.Code_Model, false);
        const fileContent = result?.content || null;
        let data = null;

        if (fileContent) {
            try {
                data = parseACMFile(fileContent);
            } catch (e: any) {
                console.error("Failed to parse code model:", e);
                throw new Error("Failed to parse the code model. The file might be corrupted or in an invalid format.");
            }
        }
        return {data, fileContent};
    };

    const {data: codeModel, fileContent, isLoading, error} = useDataLoader<CodeModelUnit>(id, loadCodeModel);

    if (isLoading) {
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