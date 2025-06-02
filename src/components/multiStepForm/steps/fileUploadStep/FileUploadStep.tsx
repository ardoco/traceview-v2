import { useFormContext } from "@/components/multiStepForm/ProjectFormContext";
import DragAndDrop from "@/components/multiStepForm/steps/fileUploadStep/dragAndDrop/DragAndDrop";
import DroppedFilesList from "@/components/multiStepForm/steps/fileUploadStep/dragAndDrop/DroppedFilesList";
import {FileType} from "@/components/dataTypes/FileType";

function FileUploadStep() {
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
            <DroppedFilesList files={formData.files} />
        </div>
    );
}

export default FileUploadStep;
