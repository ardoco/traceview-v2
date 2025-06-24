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
            fileType: preselectFileType(file), // Preselect file type based on extension
        }));

        updateFormData({ files: [...formData.files, ...updatedFiles] });
    };



    return (
        <div className="">
            <DragAndDrop handleFilesChangeAction={addFiles} />
            <DroppedFilesList files={formData.files} />
        </div>
    );
}

// add function to preselect file type based on file extension
// This function can be used to preselect the file type based on the file extension
function preselectFileType(file: File): FileType {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'uml':
            return FileType.Architecture_Model_UML;
        case 'repository':
            return FileType.Architecture_Model_PCM;
        case 'txt':
            return FileType.Architecture_Documentation;
        case 'acm':
            return FileType.Code_Model;
        default:
            return FileType.None; // Default type if no match
    }
}

export default FileUploadStep;
