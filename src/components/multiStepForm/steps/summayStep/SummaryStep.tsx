import {useFormContext} from "@/components/multiStepForm/ProjectFormContext";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";

export default function SummaryStep() {
    const { formData } = useFormContext();

    return (
            <div className="bg-gray-100 p-4 rounded-lg shadow-xs border border-gray-300 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                    <span className="font-bold">Project Name:</span> {formData.projectName}
                </p>
                <p className="text-sm font-medium text-gray-700 mb-4">
                    <span className="font-bold">Selected TraceLink Type:</span> {formData.selectedTraceLinkType? formData.selectedTraceLinkType.name: "None"}
                </p>
                <h3 className="text-md font-semibold text-gray-800 mb-2">Files:</h3>
                <div>
                    {formData.files.map((uploadedFile, index) => (
                        <SummaryFileListItem key={index} uploadedFile={uploadedFile} />
                    ))}
                </div>
            </div>
    );
}

interface SummaryFileListProps {
    uploadedFile: UploadedFile;
}


function SummaryFileListItem({ uploadedFile }: SummaryFileListProps) {
    return (
        <div
            className="flex flex-row items-center w-full border border-gray-300 rounded-lg px-4 py-3 mb-2 shadow-xs bg-white">
            <div
                className="flex-1 truncate text-sm font-medium text-gray-700"
                title={uploadedFile.file.name}
            >
                {uploadedFile.file.name}
            </div>

            <div className="flex-1 text-sm font-medium text-gray-500 text-center">
                {uploadedFile.fileType}
            </div>
        </div>
    );
}
