'use client'

import React, {useEffect, useState} from "react";
import {FileType} from "@/components/dataTypes/FileType";
import {
    parseDocumentationText
} from "@/components/traceLinksResultViewer/views/documentation/parser/DocumentationParser";
import {Sentence} from "@/components/traceLinksResultViewer/views/documentation/dataModel/DocumentationSentence";
import TooltipInstruction from "@/components/traceLinksResultViewer/TooltipInstruction";
import {SentenceView} from "@/components/traceLinksResultViewer/views/documentation/viewer/SentenceView";
import {loadProjectFile} from "@/util/ClientFileStorage";
import ViewProps from "@/components/traceLinksResultViewer/views/ViewProps";
import LoadingMessage, {ErrorMessage} from "@/components/traceLinksResultViewer/Loading";
import {LoaderResult, useDataLoader} from "@/util/useDataLoader";

export default function DisplayDocumentation({id}: ViewProps) {

    const loadDocumentation = async (id: string): Promise<LoaderResult<Sentence[]>> => {
        const result = await loadProjectFile(id, FileType.Architecture_Documentation, false);
        const fileContent = result?.content || null;
        let data = null;
        if (result && result.content) {
            try {
                data = parseDocumentationText(result.content);
            } catch (e: any) {
                console.error("Failed to parse code model:", e);
                throw new Error("Failed to parse the code model. The file might be corrupted or in an invalid format.");
            }
        }
        return {data, fileContent}
    };

    const { data: sentences, fileContent, isLoading, error } = useDataLoader<Sentence[]>(id, loadDocumentation);

    if (isLoading) {
        return <LoadingMessage title="documentation" />;
    }

    if (error) {
        return <ErrorMessage error={error}/>;
    }

    return (
        <div className="px-2 pb-2" style={{height: "calc(100% - 40px)"}}>
            <ul className={"space-y-2 max-h-full min-w-0 overflow-y-auto"}>
                {sentences && sentences.map((sentence, index) => <SentenceView sentence={sentence} key={index}/>)}
            </ul>

            <TooltipInstruction
                title="Instructions"
                position="bottom-right"
                instructions={[
                    {keyCombo: "Click", description: "Highlight TraceLink from TraceLInks"},
                ]}
            />
        </div>
    );
}

