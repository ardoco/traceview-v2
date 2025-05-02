'use client'

import React, {JSX, use, useEffect, useRef, useState} from "react";
import {FileType} from "@/components/dataTypes/FileType";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {loadProjectFile} from "@/components/callArDoCoAPI";
import {
    VisualizationFactory,
    VisualizationType
} from "@/components/traceLinksResultViewer/graphVisualizations/VisualizationFactory";
import {Style} from "@/components/traceLinksResultViewer/graphVisualizations/style";
import {parseNLTXT} from "@/components/traceLinksResultViewer/util/parser/DocumentationParser";
import NLHighlightingVisualization
    from "@/components/traceLinksResultViewer/graphVisualizations/DocumentationHighlightingVisualization";
import {Sentence} from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/DocumentationSentence";
import {useHighlightContext} from "@/components/traceLinksResultViewer/util/HighlightContextType";

interface DisplayDocumentationProps {
    JSONResult: any;
    id: string;
}

export default function DisplayDocumentation({JSONResult, id}: DisplayDocumentationProps) {
    const [projectFile, setProjectFile] = useState<UploadedFile | null>();
    const [fileContent, setFileContent] = useState<string | null>();
    //const [visualizationComponent, setVisualizationComponent] = useState<JSX.Element | null>(null);
    const [sentences, setSentences] = useState<Sentence[]>([]);


    useEffect(() => {
        loadProjectFile(id, FileType.Architecture_Documentation).then((result) => {
            setProjectFile(result);
            result?.file.text().then((text) => {
                setFileContent(text);
            });
        });
    }, [id]);

    useEffect(() => {
        if (fileContent) {
            const factory = new VisualizationFactory();
            const style = Style.ARDOCO;
            //const visualization = factory.fabricateVisualization(VisualizationType.NL, [fileContent], style);
            setSentences(parseNLTXT(fileContent));
        }
    }, [fileContent]);



    return (
        <div className="w-full h-full space-y-2">
            {sentences.map((sentence, index) => <SentenceView sentence={sentence} index={index} key={index}/>)}
            {/*{visualizationComponent ? visualizationComponent : <div>Loading visualization...</div>}*/}
        </div>
    );
}

function SentenceView({sentence, index}: { sentence: Sentence, index: number }) {
    const {highlightElement, highlightedTraceLinks} = useHighlightContext();

    return (
        <div
            className={`flex items-center p-2 rounded-lg transition cursor-pointer 
                ${highlightedTraceLinks.some(traceLink => traceLink.sentenceId == index.toString()) ? "bg-yellow-300" : "bg-white"}
                hover:bg-gray-200
              `}
            onClick={() => highlightElement(index.toString(), "sentenceId")}
        >
            <span className="mr-3 font-bold text-gray-600">{index}.</span>
            <p className="flex-1 text-black">{sentence.getContent()}</p>
        </div>
    );
}
