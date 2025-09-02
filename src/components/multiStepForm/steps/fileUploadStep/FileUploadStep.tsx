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
        const includesTraceLinkInName = file.name.toLowerCase().includes('trace') && allowedFileTypes.includes(FileType.traceLinks);
        const includesInconsistenciesInName = file.name.toLowerCase().includes('inconsistenc') && allowedFileTypes.includes(FileType.inconsistencies);

        if (extension === 'uml') {
            return FileType.architectureModelUML;
        } else if (extension === 'repository') {
            return FileType.architectureModelPCM;
        } else if (extension === 'txt') {
            return FileType.documentation;
        } else if (extension === 'acm') {
            return FileType.codeModel;
        } else if (extension === 'json' && includesTraceLinkInName) {
            return FileType.traceLinks;
        } else if (extension === 'json' && includesInconsistenciesInName) {
            return FileType.inconsistencies;
        } else {
            return FileType.None;
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
