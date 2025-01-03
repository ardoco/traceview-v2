import FileListItem from "@/components/drag-and-drop/FileListItem";
import { UploadedFile } from "@/components/drag-and-drop/FileListItem";
import {useFormContext} from "@/components/multi-step-form-wizard/ProjectFormContext";

interface FileListDragDropProps {
    files: UploadedFile[];
}

export default function FileListDragDrop({ files}: FileListDragDropProps) {

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
                <div>
                    <h4>Selected Files:</h4>
                    <ul>
                        {files.map((uploadedFile, index) => (
                            <li key={index}>
                                <FileListItem
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
