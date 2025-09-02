import React from 'react';
import DragAndDrop from "@/components/multiStepForm/steps/fileUploadStep/dragAndDrop/DragAndDrop";

interface Props {
    uploadedFile: File | null;
    fileParseError: string | null;
    handleFileChange: (files: FileList) => void;
}

export default function FileUploadSection({uploadedFile, fileParseError, handleFileChange}: Props) {
    return (
        <div className="w-full p-6 rounded-lg border border-gray-100">
            <h4 className="text-md font-semibold text-gray-800 mb-4 text-center">Upload Configuration File</h4>
            <DragAndDrop handleFilesChangeAction={handleFileChange} singleFileUpload={true}/>
            {uploadedFile &&
                <p className="text-sm text-gray-500 mt-2 text-center">Selected file: {uploadedFile.name}</p>}
            {fileParseError &&
                <p className="text-sm text-red-500 mt-2 text-center">{fileParseError}</p>
            }
            <p className="text-sm text-green-600 mt-4 text-center">
                {uploadedFile && !fileParseError &&
                    'File successfully uploaded. You can now switch to the manual input tab to edit the configuration.'
                }
                {!uploadedFile && !fileParseError &&
                    'Upload a JSON file containing your custom TraceLink configuration.'
                }
            </p>
        </div>
    );
}
