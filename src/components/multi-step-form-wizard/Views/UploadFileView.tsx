import { FileType } from "@/components/drag-and-drop/FileListItem";
import { useFormContext } from "@/components/multi-step-form-wizard/ProjectFormContext";
import DragAndDrop from "@/components/drag-and-drop/drag-and-drop";
import FileListDragDrop from "@/components/drag-and-drop/FileListDragDrop";
import Validation from "@/components/multi-step-form-wizard/Validation";

function UploadFileView() {
    const { formData, updateFormData } = useFormContext();

    const addFiles = (newFiles: FileList) => {
        const newUploadedFiles = Array.from(newFiles).filter(
            (file) => !formData.files.some((uploadedFile) => uploadedFile.file.name === file.name)
        );

        // Map new files to the UploadedFile format with default FileType
        const updatedFiles = newUploadedFiles.map((file) => ({
            file,
            fileType: FileType.None,
        }));

        updateFormData({ files: [...formData.files, ...updatedFiles] });

        console.log(formData);// Pass errors to parent component
    };



    return (
        <div className="flex-col">
            <DragAndDrop handleFilesChangeAction={addFiles} />
            <FileListDragDrop files={formData.files} />
        </div>
    );
}

export default UploadFileView;
