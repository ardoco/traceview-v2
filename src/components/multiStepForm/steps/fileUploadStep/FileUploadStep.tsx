import {useFormContext} from "@/contexts/ProjectUploadContext";
import DragAndDrop from "@/components/multiStepForm/steps/fileUploadStep/dragAndDrop/DragAndDrop";
import DroppedFilesList from "@/components/multiStepForm/steps/fileUploadStep/dragAndDrop/DroppedFilesList";
import {FileType} from "@/components/dataTypes/FileType";

function FileUploadStep() {
    const {formData, updateFormData, allowedFileTypes} = useFormContext();

    const addFiles = (newFiles: FileList) => {
        const newUploadedFiles = Array.from(newFiles).filter(
            (file) => !formData.files.some((uploadedFile) => uploadedFile.file.name === file.name)
        );

        const updatedFiles = newUploadedFiles.map((file) => ({
            file,
            fileType: preselectFileType(file),
        }));

        updateFormData({files: [...formData.files, ...updatedFiles]});
    };

    // This function can be used to preselect the file type based on the file extension
    function preselectFileType(file: File): FileType {
        const extension = file.name.split('.').pop()?.toLowerCase();
        const includesTraceLinkInName = file.name.toLowerCase().includes('trace') && allowedFileTypes.includes(FileType.TRACELINKS);
        const includesInconsistenciesInName = file.name.toLowerCase().includes('inconsistenc') && allowedFileTypes.includes(FileType.INCONSISTENCIES);

        if (extension === 'uml') {
            return FileType.ARCHITECTURE_MODEL_UML;
        } else if (extension === 'repository') {
            return FileType.ARCHITECTURE_MODEL_PCM;
        } else if (extension === 'txt') {
            return FileType.DOCUMENTATION;
        } else if (extension === 'acm') {
            return FileType.CODE_MODEL;
        } else if (extension === 'json' && includesTraceLinkInName) {
            return FileType.TRACELINKS;
        } else if (extension === 'json' && includesInconsistenciesInName) {
            return FileType.INCONSISTENCIES;
        } else {
            return FileType.NONE;
        }
    }

    return (
        <div className="">
            <DragAndDrop handleFilesChangeAction={addFiles}/>
            <DroppedFilesList files={formData.files}/>
        </div>
    );
}

export default FileUploadStep;
