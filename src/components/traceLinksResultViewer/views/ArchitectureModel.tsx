'use client'

import React, { useEffect, useState } from "react";
import { FileType } from "@/components/dataTypes/FileType";
import { UploadedFile } from "@/components/dataTypes/UploadedFile";
import { loadProjectFile } from "@/components/callArDoCoAPI";
import {
    VisualizationFactory,
    VisualizationType
} from "@/components/traceLinksResultViewer/graphVisualizations/VisualizationFactory";
import { Style } from "@/components/traceLinksResultViewer/graphVisualizations/style";

interface DisplayDocumentationProps {
    JSONResult: any;
    id: string;
}

export default function DisplayArchitectureModel({ JSONResult, id }: DisplayDocumentationProps) {
    const [projectFile, setProjectFile] = useState<UploadedFile | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [container, setContainer] = useState<HTMLDivElement | null>(document.createElement("div"));

    useEffect(() => { // Load the architecture model file on component mount
        loadProjectFile(id, FileType.Architecture_Model_UML).then((result) => {
            setProjectFile(result);
            result?.file.text().then((text) => {
                setFileContent(text);
            });
        });
    }, [id]);

    useEffect(() => {
        console.log(fileContent);
        if (fileContent && container) {
            console.log("hi");
            const factory = new VisualizationFactory();
            const style = Style.ARDOCO;

            try {
                const visualizationGenerator = factory.fabricateVisualization(VisualizationType.UML, [fileContent], style);
                // @ts-ignore
                visualizationGenerator(container);
            } catch (e) {
                console.error(e);
            }
        }
    }, [fileContent, container]);

    return (
        <div>
            {container ? (
                <div key={fileContent} ref={setContainer} className="w-full h-full" />
            ) : (
                <div className="whitespace-pre">
                    {fileContent}
                </div>
            )}
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