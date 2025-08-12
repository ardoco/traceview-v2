import DroppedFile from "@/components/multiStepForm/steps/fileUploadStep/dragAndDrop/DroppedFile";
import {useFormContext} from "@/contexts/ProjectUploadContext";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";

interface FileListDragDropProps {
    files: UploadedFile[];
}

export default function DroppedFilesList({ files}: FileListDragDropProps) {

    const { formData, updateFormData } = useFormContext();

    const deleteFile = (deletedFile: UploadedFile) => {
        updateFormData({
            files: formData.files.filter(
                (uploadedFile) =>
                    uploadedFile.file.name !== deletedFile.file.name ||
                    uploadedFile.fileType !== deletedFile.fileType
            ),
        });

    };

    return (
        <div>
            {(files ?? []).length > 0 && (
                <div className="mt-6">
                    <h4>Selected Files:</h4>
                    <ul>
                        {files.map((uploadedFile, index) => (
                            <li key={index}>
                                <DroppedFile
                                    index={index}
                                    file={uploadedFile.file}
                                    fileType={uploadedFile.fileType}
                                    onDelete={() => deleteFile(uploadedFile)}
                                />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
