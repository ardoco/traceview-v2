'use client'

import React, {useEffect, useState} from "react";
import {FileType} from "@/components/dataTypes/FileType";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {loadProjectFile} from "@/components/callArDoCoAPI";

interface DisplayDocumentationProps {
    JSONResult: any;
    id: string;
}

export default function DisplayArchitectureModel({JSONResult, id}: DisplayDocumentationProps) {
    const [projectFile, setProjectFile] = useState<UploadedFile | null>();
    const [fileContent, setFileContent] = useState<string | null>();

    useEffect(() => { // load the architecture model file on component mount
        loadProjectFile(id, FileType.Architecture_Model_PCM).then((result) => {
            setProjectFile(result);
            result?.file.text().then((text) => {
                setFileContent(text);
            });
        });
    }, []);

    if (!projectFile) {
        return <div>No file to display.</div>
    }

    return (
        <div className="whitespace-pre">
            {fileContent}
        </div>
    )
}