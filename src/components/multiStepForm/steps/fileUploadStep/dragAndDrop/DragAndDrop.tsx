'use client'

import {ChangeEvent, DragEvent, useRef, useState} from "react";

interface DragAndDropProps {
    handleFilesChangeAction: (files: FileList) => void;
    singleFileUpload?: boolean; // Optional prop to handle single file uploads
}

export default function DragAndDrop({handleFilesChangeAction, singleFileUpload = false}: DragAndDropProps) {
    const [dragActive, setDragActive] = useState(false);
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
            handleFilesChangeAction(event.dataTransfer.files);
        }
    };

    return (
        <div className={'grow'}>
            <div
                className={`rounded-lg content-center border-2 border-dashed w-full p-5 mx-auto text-center ${
                    dragActive ? "border-blau-400" : "border-gray-300"
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
                        e.target.files && handleFilesChangeAction(e.target.files)
                    }
                />

                {!singleFileUpload ? (
                        <div>
                            <p className="text-gray-700">Drag and drop files here or</p>
                            <button
                                onClick={() => inputRef.current?.click()}
                                className="text-gray-700 text-center py-2.5 px-5 inline-block my-0.5 mx-1 cursor-pointer"
                            >
                                Select Files
                            </button>
                        </div>
                    ) :
                    (
                        <button
                            onClick={() => inputRef.current?.click()}
                            className="text-gray-700 text-center px-5 inline-block my-0.5 mx-1 cursor-pointer"
                        >
                            Drop file here or select
                        </button>
                    )}
            </div>
        </div>
    );

}
