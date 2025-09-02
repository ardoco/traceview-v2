import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import React from "react";

interface SummaryFileListProps {
    uploadedFile: UploadedFile;
}

export function SummaryFileListItem({uploadedFile}: SummaryFileListProps) {
    return (
        <div
            className="flex flex-row items-center w-full border border-gray-300 rounded-lg px-4 py-3 mb-2 shadow-xs bg-white">
            <div
                className="flex-1 truncate text-sm font-medium text-gray-700"
                title={uploadedFile.file.name}
            >
                {uploadedFile.file.name}
            </div>

            <div className="flex-1 text-sm font-medium text-gray-600 text-right">
                {uploadedFile.fileType}
            </div>
        </div>
    );
}