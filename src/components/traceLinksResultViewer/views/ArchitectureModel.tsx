'use client'

import React, {useEffect, useState} from "react";
import {FileType} from "@/components/dataTypes/FileType";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {loadProjectFile} from "@/components/callArDoCoAPI";
import {
    VisualizationFactory,
    VisualizationType
} from "@/components/traceLinksResultViewer/graphVisualizations/VisualizationFactory";
import {Style} from "@/components/traceLinksResultViewer/graphVisualizations/style";
import {UMLModel} from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/UMLDataModel";
import parseUML from "@/components/traceLinksResultViewer/util/parser/UMLParser2";
import UMLDiagramVisualization from "@/components/traceLinksResultViewer/graphVisualizations/UMLDiagramVisualization";
import parseUMLModel, {AbstractComponent, Edge} from "@/components/traceLinksResultViewer/util/parser/UMLParser3";
import UMLViewer from "@/components/traceLinksResultViewer/graphVisualizations/umlViewer/UMLViewer";

interface DisplayDocumentationProps {
    JSONResult: any;
    id: string;
}

export default function DisplayArchitectureModel({JSONResult, id}: DisplayDocumentationProps) {
    const [projectFile, setProjectFile] = useState<UploadedFile | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    //const [container, setContainer] = useState<HTMLDivElement | null>(document.createElement("div"));
    const [umlModel, setUMLModel] = useState<{ components: AbstractComponent[], edges: Edge[] } | null>(null); // TODO: Define the type for UMLModel

    useEffect(() => { // Load the architecture model file on component mount
        loadProjectFile(id, FileType.Architecture_Model_UML).then((result) => {
            setProjectFile(result);
            result?.file.text().then((text) => {
                setFileContent(text);
                const parsedUMLModel = parseUMLModel(text);
                setUMLModel(parsedUMLModel);
            });
        });
    }, [id]);

    // useEffect(() => {
    //     if (fileContent && container) {
    //         const factory = new VisualizationFactory();
    //         const style = Style.ARDOCO;
    //
    //         try {
    //             const visualizationGenerator = factory.fabricateVisualization(VisualizationType.UML, [fileContent], style);
    //             // @ts-ignore
    //             visualizationGenerator(container);
    //             const parsedUMLModel = parseUMLModel(fileContent);
    //             console.log("parsedUMLModel", parsedUMLModel);
    //         } catch (e) {
    //             console.error(e);
    //         }
    //     }
    // }, [fileContent, container]);

    // useEffect(() => {
    //     if (fileContent) {
    //         setUMLModel(parseUML(fileContent));
    //
    //     }
    // }, [fileContent]);

    return (
        <div className="w-full" style={{height: "calc(100% - 40px)"}}>
            {umlModel ? (
                <UMLViewer umlComponents={umlModel.components} umlEdges={umlModel.edges}/>
            ) : (
                <div className="whitespace-pre">
                    {fileContent}
                </div>
            )}
        </div>
        // <div>
        //     {umlModel && (
        //
        //     <UMLDiagramVisualization umlModel={umlModel}/>
        //         )}
        // </div>
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