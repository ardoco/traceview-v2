'use client'

import React, {useEffect, useState} from "react";
import {FileType} from "@/components/dataTypes/FileType";
import parseUMLModel from "@/components/traceLinksResultViewer/views/architectureModel/parser/UMLParser";
import UMLViewer from "@/components/traceLinksResultViewer/views/architectureModel/viewer/UMLViewer";
import TooltipInstruction from "@/components/traceLinksResultViewer/TooltipInstruction";
import {parsePCM} from "@/components/traceLinksResultViewer/views/architectureModel/parser/PCMParser";
import {AbstractComponent, Edge} from "@/components/traceLinksResultViewer/views/architectureModel/dataModel/ArchitectureDataModel";
import {loadProjectFile} from "@/util/ClientFileStorage";
import ViewProps from "@/components/traceLinksResultViewer/views/ViewProps";

export default function DisplayArchitectureModel({JSONResult, id}: ViewProps) {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [architectureModel, setArchitectureModel] = useState<{ components: AbstractComponent[], edges: Edge[] } | null>(null);

    useEffect(() => {
        async function loadModel() {
            const result = await loadProjectFile(id, FileType.Architecture_Model_UML); // fallback type

            if (!result) return;

            const text = await result.file.text();
            setFileContent(text);

            switch (result.fileType) {
                case FileType.Architecture_Model_UML:
                    const parsedUML = parseUMLModel(text);
                    setArchitectureModel(parsedUML);
                    break;

                case FileType.Architecture_Model_PCM:
                    const parsedPCM = parsePCM(text);
                    setArchitectureModel(parsedPCM);
                    break;

                default:
                    console.warn("Unknown architecture model file type:", result.fileType);
            }
        }
        loadModel();
    }, [id]);


    return (
        <div className="relative w-full" style={{height: "calc(100% - 40px)"}}>
            {architectureModel ? (
                <UMLViewer umlComponents={architectureModel.components} umlEdges={architectureModel.edges}/>
            ) : (
                <div className="whitespace-pre">
                    {fileContent}
                </div>
            )}

            <TooltipInstruction
                title="Instructions"
                instructions={[
                    { keyCombo: "Click", description: "Highlight traceLinks" },
                    { keyCombo: "Hover over interface's name", description: "display details" },
                ]}
            />

        </div>
    );
}
