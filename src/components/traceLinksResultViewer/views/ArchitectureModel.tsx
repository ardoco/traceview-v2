'use client'

import React, {useEffect, useState} from "react";
import {FileType} from "@/components/dataTypes/FileType";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {loadProjectFile} from "@/components/callArDoCoAPI";
import parseUMLModel, {AbstractComponent, Edge} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";
import UMLViewer2 from "@/components/traceLinksResultViewer/umlComponentDiagram2/UMLViewer2";
import TooltipInstruction from "@/components/traceLinksResultViewer/TooltipInstruction";
import {parsePCM} from "@/components/traceLinksResultViewer/util/parser/PCMparser";

interface DisplayDocumentationProps {
    JSONResult: any;
    id: string;
}

export default function DisplayArchitectureModel({JSONResult, id}: DisplayDocumentationProps) {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [architectureModel, setArchitectureModel] = useState<{ components: AbstractComponent[], edges: Edge[] } | null>(null); // TODO: Define the type for UMLModel
    //
    // useEffect(() => { // Load the architecture model file on component mount
    //     loadProjectFile(id, FileType.Architecture_Model_UML).then((result) => {
    //         result?.file.text().then((text) => {
    //             setFileContent(text);
    //             const parsedUMLModel = parseUMLModel(text);
    //             setArchitectureModel(parsedUMLModel);
    //         });
    //     });
    // }, [id]);

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
                <UMLViewer2 umlComponents={architectureModel.components} umlEdges={architectureModel.edges}/>
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


// 'use client'
//
// import React, {useEffect, useRef, useState} from "react";
// import {FileType} from "@/components/dataTypes/FileType";
// import {UploadedFile} from "@/components/dataTypes/UploadedFile";
// import {loadProjectFile} from "@/components/callArDoCoAPI";
// import {
//     VisualizationFactory,
//     VisualizationType
// } from "@/components/traceLinksResultViewer/graphVisualizations/VisualizationFactory";
// import {Style} from "@/components/traceLinksResultViewer/graphVisualizations/style";
//
// interface DisplayDocumentationProps {
//     JSONResult: any;
//     id: string;
// }
//
// export default function DisplayArchitectureModel({JSONResult, id}: DisplayDocumentationProps) {
//     const [projectFile, setProjectFile] = useState<UploadedFile | null>();
//     const [fileContent, setFileContent] = useState<string | null>();
//     const visualizationContainerRef = useRef<HTMLDivElement>(null);
//
//     useEffect(() => { // load the architecture model file on component mount
//         loadProjectFile(id, FileType.Architecture_Model_UML).then((result) => {
//             setProjectFile(result);
//             result?.file.text().then((text) => {
//                 setFileContent(text);
//             });
//         });
//     }, []);
//
//     // if (!projectFile) {
//     //     return <div>No file to display.</div>
//     // }
//     //
//     // return (
//     //     <div className="whitespace-pre">
//     //         {fileContent}
//     //     </div>
//     // )
//
//     // //TODO somehow distinguish between PCM and UML architecture models
//     useEffect(() => {
//         console.log(fileContent)
//         if (fileContent && visualizationContainerRef.current) {
//             const factory = new VisualizationFactory();
//             const style = Style.ARDOCO;
//             console.log("hi")
//             try {
//                 const visualizationGenerator = factory.fabricateVisualization(VisualizationType.UML, [fileContent], style);
//                 visualizationGenerator(visualizationContainerRef.current);
//             } catch (e) {
//                 console.log(e);
//             }
//         }
//     }, [fileContent, visualizationContainerRef.current]);
//
//     if (!visualizationContainerRef.current) {
//         return (
//             <div className="whitespace-pre">
//                 {fileContent}
//             </div>
//         )
//     } else {
//         return (
//             <div>
//                 <div key={fileContent} ref={visualizationContainerRef} className="w-full h-full border border-gray-300" />
//             </div>
//         );
//     }
//
// }