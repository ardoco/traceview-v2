'use client'

import React, { useEffect, useState } from "react";
import {FileType} from "@/components/dataTypes/FileType";
import {parseCodeFromACM} from "@/components/traceLinksResultViewer/views/codeModel/parser/ACMParser";
import {CodeModelUnit} from "@/components/traceLinksResultViewer/views/codeModel/dataModel/ACMDataModel";
import ACMViewer from "@/components/traceLinksResultViewer/views/codeModel/viewer/ACMViewer";
import TooltipInstruction from "@/components/traceLinksResultViewer/TooltipInstruction";
import {loadProjectFile} from "@/util/ClientFileStorage";
import ViewProps from "@/components/traceLinksResultViewer/views/ViewProps";

export default function DisplayCodeModel({JSONResult, id}: ViewProps) {
    const [fileContent, setFileContent] = useState<string | null>();
    const [codeModel, setCodeModel] = useState<CodeModelUnit | any>(null);

    useEffect(() => {
        loadProjectFile(id, FileType.Code_Model).then((result) => {
            result?.file.text().then((text) => {
                setFileContent(text);

                // init code model
                if (text) {
                    const parsedCodeModel2 = parseCodeFromACM(text);
                    setCodeModel(parsedCodeModel2);
                }
            });
        });
    }, []);

    return (

        <div className=" relative w-full" style={{height: "calc(100% - 40px)"}}>
            {codeModel ? (
                <ACMViewer codeModel={codeModel}/>

            ) : (
                <div className="whitespace-pre">
                    {fileContent}
                </div>
            )}

            <TooltipInstruction
                title="Instructions"
                instructions={[
                    { keyCombo: "Click", description: "Highlight path to root" },
                    { keyCombo: "Ctrl + Click", description: "Collapse/Expand node" },
                ]}
            />
        </div>

    );
}