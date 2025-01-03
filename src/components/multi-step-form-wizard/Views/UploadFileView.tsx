import {FileType} from "@/components/drag-and-drop/FileListItem";
import {useFormContext} from "@/components/multi-step-form-wizard/ProjectFormContext";
import DragAndDrop from "@/components/drag-and-drop/drag-and-drop";
import FileListDragDrop from "@/components/drag-and-drop/FileListDragDrop";

export default function UploadFileView() {
    const { formData, updateFormData } = useFormContext();

    const addFiles = (newFiles: FileList) => {

        // Convert FileList to Array and filter out already added files
        const newUploadedFiles = Array.from(newFiles).filter(
            (file) => !formData.files.some((uploadedFile) => uploadedFile.file.name === file.name)
        );

        // Map new files to the UploadedFile format with default FileType
        const updatedFiles = newUploadedFiles.map((file) => ({
            file,
            fileType: FileType.None,
        }));

        // Update form data
        updateFormData({ files: [...formData.files, ...updatedFiles] });
    };

    return (
        <div className="flex-col">
            <DragAndDrop handleFilesChange={addFiles}/>
            <FileListDragDrop
                files={formData.files}
            />
        </div>
    )
}