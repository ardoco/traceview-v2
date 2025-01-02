'use client'

import { ChangeEvent, DragEvent, useRef, useState } from "react";

interface DragAndDropProps {
    handleFilesChange: (files: FileList) => void;
}

export default function DragAndDrop({handleFilesChange}: DragAndDropProps) {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.type === "dragenter" || event.type === "dragover") {
            setDragActive(true);
        } else if (event.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(false);
        if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
            handleFilesChange(event.dataTransfer.files);
        }
    };


    const uploadFiles = async () => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file);
        });

        try {
            console.log(formData);
        } catch (error) {
            console.error("Error uploading files:", error);
        }
    };

    return (
        <div className={'flex-grow'}>
            <div
                className={`content-center border-2 border-dashed w-full p-5 mx-auto text-center ${
                    dragActive ? "border-blue-700" : "bordder-blue-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
            <input
                className="hidden"
                type="file"
                ref={inputRef}
                multiple
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    e.target.files && handleFilesChange(e.target.files)
                }
            />
            <p>Drag and drop files here or</p>
            <button
                onClick={() => inputRef.current?.click()}
                className="text-center py-2.5 px-5 inline-block my-0.5 mx-1 cursor-pointer"
            >
                Select Files
            </button>
            </div>
        </div>
    );

}
