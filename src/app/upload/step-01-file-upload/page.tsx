'use client'

import {Layout} from "@/components/inputPipeline/Layout";
import {PipelineLayout} from "@/components/inputPipeline/PipelineLayout";
import Step from "@/components/inputPipeline/Steps";
import DragAndDrop from "@/components/drag-and-drop/drag-and-drop";
import {useState} from "react";
import FileListDragDrop from "@/components/drag-and-drop/FileListDragDrop";

export default function newUploadProject() {

    const [files, setFiles] = useState<File[]>([]);

    const addFiles = (newFiles: FileList) => {
        setFiles(files.concat(Array.from(newFiles)));
    };

    const deleteFile = (deletedFile: File) => {
        setFiles(files.filter((file) => file !== deletedFile));
    }


    return (
        <Layout>
            <PipelineLayout>
                <Step>
                    <div className={"flex-col"}>
                        <h1>Upload project files! </h1>
                        <DragAndDrop handleFilesChange={addFiles}/>
                        <FileListDragDrop files={files} onDelete={deleteFile}/>
                    </div>
                </Step>
            </PipelineLayout>
        </Layout>
    );
}