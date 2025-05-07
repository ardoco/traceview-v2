'use client'

import React, { useEffect, useRef, useState } from "react";
import {FileType} from "@/components/dataTypes/FileType";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {loadProjectFile} from "@/components/callArDoCoAPI";
import {CodeModelVisualization} from "@/components/traceLinksResultViewer/graphVisualizations/CodeModelVisualization";
import {parseCodeFromACM2} from "@/components/traceLinksResultViewer/util/parser/ACMparser2";
import {CodeModelUnit} from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/ACMDataModel";
import ACMViewer from "@/components/traceLinksResultViewer/graphVisualizations/acmViewer/ACMViewer";

interface DisplayCodeModelProps {
    JSONResult: any;
    id: string;
}

export default function DisplayCodeModel({JSONResult, id}: DisplayCodeModelProps) {
    const [projectFile, setProjectFile] = useState<UploadedFile | null>();
    const [fileContent, setFileContent] = useState<string | null>();
    const visualizationContainerRef = useRef<HTMLDivElement>(null);
    const [codeModel, setCodeModel] = useState<CodeModelUnit | any>(null);

    useEffect(() => {
        loadProjectFile(id, FileType.Code_Model).then((result) => {
            setProjectFile(result);
            result?.file.text().then((text) => {
                setFileContent(text);
                initializeCodeModel(text);
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
    // useEffect(() => {
    //     if (fileContent && visualizationContainerRef.current) {
    //         const factory = new VisualizationFactory();
    //         const style = Style.ARDOCO;
    //         const parsedCodeModel = parseCodeFromACM(fileContent);
    //         console.log("parsedCodeModel1", parsedCodeModel);
    //         const parsedCodeModel2 = parseCodeFromACM2(fileContent);
    //         console.log("parsedCodeModel2", parsedCodeModel2);
    //         setCodeModel(parsedCodeModel);
    //
    //         const visualizationGenerator = factory.fabricateVisualization(VisualizationType.CODE, [fileContent], style);
    //
    //         // @ts-ignore
    //         visualizationGenerator(visualizationContainerRef.current);
    //     }
    // }, []);

    function initializeCodeModel(content: string | null) {
        //if (!content || !visualizationContainerRef.current) return;

        // const factory = new VisualizationFactory();
        // const style = Style.ARDOCO;

        // const parsedCodeModel = parseCodeFromACM(content? content : "");
        // console.log("parsedCodeModel1", parsedCodeModel);

        const parsedCodeModel2 = parseCodeFromACM2(content? content : "");
        console.log("parsedCodeModel2", parsedCodeModel2);

        setCodeModel(parsedCodeModel2);

        //const visualizationGenerator = factory.fabricateVisualization(VisualizationType.CODE, [content], style);
        // @ts-ignore
        //visualizationGenerator(visualizationContainerRef.current);
    }

    /*return (

        <div className="w-full" style={{height: "calc(100% - 40px)"}}>
            {codeModel ? (
                <CodeModelVisualization codeModel={codeModel}/>
            ) : (
                <div className="whitespace-pre">
                    {fileContent}
                </div>
            )}
        </div>

    );*/

    return (

        <div className="w-full" style={{height: "calc(100% - 40px)"}}>
            {codeModel ? (
                <ACMViewer codeModel={codeModel}/>
            ) : (
                <div className="whitespace-pre">
                    {fileContent}
                </div>
            )}
        </div>

    );
}