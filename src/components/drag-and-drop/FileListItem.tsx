import { Button } from "@headlessui/react";
import {useFormContext} from "@/components/multi-step-form-wizard/ProjectFormContext";
import Dropdown from "@/components/inputComponents/Dropdown";

export enum FileType {
    Architecture_Documentation = "Documentation",
    Architecture_Model_UML = "UML",
    Architecture_Model_PCM = "PCM",
    Code_Model = "Code Model",
    None = "Select file type",
}

export function convertStringToFileType(value: string): FileType {
    return (Object.values(FileType) as Array<string>).includes(value) ? (value as FileType) : FileType.None;
}


export interface UploadedFile {
    file: File;
    fileType: FileType;
}

interface FileListItemProps {
    index: number;
    file: File;
    fileType: FileType;
    onDelete: () => void;
}

export default function FileListItem({
                                         index,
                                         file,
                                         fileType,
                                         onDelete,
                                     }: FileListItemProps) {

    const { formData, updateFormData } = useFormContext();

    const onFileTypeChange = (newType: FileType) => {

        console.log(newType);

        // Create a shallow copy of the files array
        const updatedFiles = [...formData.files];

        // Update the fileType of the file at the specified index
        updatedFiles[index] = { ...updatedFiles[index], fileType: newType };

        // Update the formData with the modified files array
        updateFormData({ files: updatedFiles });
    };


    return (
        <div className="flex flex-row items-center w-full border border-gray-300 rounded-lg px-4 py-2 mb-2 shadow-xs bg-white mt-2">
            <div
                className="flex-1 truncate text-sm font-medium text-gray-700"
                title={file.name}
            >
                {file.name}
            </div>

            <div className="flex-1 mx-4">
                <Dropdown<FileType>
                    options={Object.values(FileType)}
                    selectedValue={fileType}
                    onChange={onFileTypeChange}
                    placeholder={FileType.None}
                />
            </div>

            <Button
                onClick={onDelete}
                className="text-red-600 hover:text-red-800 transition-colors"
            >
                X
            </Button>
        </div>
    );
}

