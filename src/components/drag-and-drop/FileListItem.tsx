import { useState } from "react";
import { Button } from "@headlessui/react";

interface FileListItemProps {
    file: File;
    onDelete: (file: File) => void;
}

export default function FileListItem({ file, onDelete }: FileListItemProps) {
    const [fileType, setFileType] = useState<string>("None");

    return (
        <div className="flex flex-row items-center w-full border border-gray-300 rounded-lg px-4 py-2 mb-2 shadow-sm bg-white">
            {/* File Name */}
            <div
                className="flex-1 truncate text-sm font-medium text-gray-700"
                title={file.name}
            >
                {file.name}
            </div>

            {/* File Type Selector */}
            <div className="flex-1 mx-4">
                <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="None" disabled>
                        Select file type
                    </option>
                    <option value="Architecture Documentation">
                        Architecture Documentation
                    </option>
                    <option value="Architecture Model - UML">
                        Architecture Model - UML
                    </option>
                    <option value="Architecture Model - PCM">
                        Architecture Model - PCM
                    </option>
                    <option value="Code Model">Code Model</option>
                </select>
            </div>

            {/* Delete Button */}
            <Button
                onClick={() => onDelete(file)}
                className="text-red-600 hover:text-red-800 transition-colors"
            >
                <span className="sr-only">Delete</span>
                ✖
            </Button>
        </div>
    );
}
