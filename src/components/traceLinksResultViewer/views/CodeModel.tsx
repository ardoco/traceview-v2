'use client'

import React, { useEffect, useRef, useState } from "react";
import {FileType} from "@/components/dataTypes/FileType";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {loadProjectFile} from "@/components/callArDoCoAPI";
import {
    VisualizationFactory,
    VisualizationType
} from "@/components/traceLinksResultViewer/graphVisualizations/VisualizationFactory";
import {Style} from "@/components/traceLinksResultViewer/graphVisualizations/style";

interface DisplayDocumentationProps {
    JSONResult: any;
    id: string;
}

export default function DisplayDocumentation({JSONResult, id}: DisplayDocumentationProps) {
    const [projectFile, setProjectFile] = useState<UploadedFile | null>();
    const [fileContent, setFileContent] = useState<string | null>();
    const visualizationContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadProjectFile(id, FileType.Code_Model).then((result) => {
            setProjectFile(result);
            result?.file.text().then((text) => {
                setFileContent(text);
            });
        });
    }, []);

    // if (!projectFile) {
    //     return <div>No file to display.</div>
    // }
    //
    // return (
    //     <div className="whitespace-pre">
    //         {fileContent}
    //     </div>
    // )
    useEffect(() => {
        if (fileContent && visualizationContainerRef.current) {
            const factory = new VisualizationFactory();
            const style = Style.ARDOCO;
            const visualizationGenerator = factory.fabricateVisualization(VisualizationType.CODE, [fileContent], style);

            // @ts-ignore
            visualizationGenerator(visualizationContainerRef.current);
        }
    }, [fileContent]);

    return (
        <div>
            <div ref={visualizationContainerRef} className="w-full h-full" />
        </div>
    );
}