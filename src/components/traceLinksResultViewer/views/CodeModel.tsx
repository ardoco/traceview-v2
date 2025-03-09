'use client'

import React, {use, useEffect, useState} from "react";
import {FileType} from "@/components/dataTypes/FileType";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {loadProjectFile} from "@/components/callArDoCoAPI";

interface DisplayDocumentationProps {
    JSONResult: any;
    id: string;
}

export default function DisplayDocumentation({JSONResult, id}: DisplayDocumentationProps) {
    const [projectFile, setProjectFile] = useState<UploadedFile | null>();
    const [fileContent, setFileContent] = useState<string | null>();

    useEffect(() => {
        loadProjectFile(id, FileType.Code_Model).then((result) => {
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