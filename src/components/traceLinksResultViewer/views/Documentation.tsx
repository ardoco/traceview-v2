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

interface DisplayDocumentationProps {
    JSONResult: any;
    id: string;
}

export default function DisplayDocumentation({JSONResult, id}: DisplayDocumentationProps) {
    const [projectFile, setProjectFile] = useState<UploadedFile | null>();
    const [fileContent, setFileContent] = useState<string | null>();
    const [visualizationComponent, setVisualizationComponent] = useState<JSX.Element | null>(null);


    useEffect(() => {
        loadProjectFile(id, FileType.Architecture_Documentation).then((result) => {
            setProjectFile(result);
            result?.file.text().then((text) => {
                setFileContent(text);
            });
        });
    }, [id]);

    // if (!projectFile) {
    //     return <div>No file to display.</div>
    // }

    // return (
    //     <div className="whitespace-pre">
    //         {fileContent}
    //     </div>
    // )

    useEffect(() => {
        if (fileContent) {
            const factory = new VisualizationFactory();
            const style = Style.ARDOCO;
            const visualization = factory.fabricateVisualization(VisualizationType.NL, [fileContent], style);

            if (React.isValidElement(visualization)) {
                setVisualizationComponent(visualization);
            }
        }
    }, [fileContent]);

    return (
        <div className="w-full h-full">
            {visualizationComponent ? visualizationComponent : <div>Loading visualization...</div>}
        </div>
    );
}
