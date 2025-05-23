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

export default function DisplayDocumentation({JSONResult, id}: ViewProps) {
    const [sentences, setSentences] = useState<Sentence[]>([]);


    useEffect(() => {
        loadProjectFile(id, FileType.Architecture_Documentation).then((result) => {
            result?.file.text().then((text) => {
                setSentences(parseDocumentationText(text));
            });
        });
    }, [id]);

    return (
        <div className="relative w-full h-full space-y-2">
            {sentences.map((sentence, index) => <SentenceView sentence={sentence} index={index} key={index}/>)}

            <TooltipInstruction
                title="Instructions"
                position="bottom-right"
                instructions={[
                    { keyCombo: "Click", description: "Highlight TraceLink from TraceLInks" },
                ]}
            />
        </div>
    );
}

