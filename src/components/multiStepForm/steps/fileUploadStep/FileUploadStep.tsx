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
        const includesTraceLinkInName = file.name.toLowerCase().includes('trace') && allowedFileTypes.includes(FileType.Trace_Link_JSON);
        const includesInconsistenciesInName = file.name.toLowerCase().includes('inconsistenc') && allowedFileTypes.includes(FileType.Inconsistencies_JSON);

        if (extension === 'uml') {
            return FileType.Architecture_Model_UML;
        } else if (extension === 'repository') {
            return FileType.Architecture_Model_PCM;
        } else if (extension === 'txt') {
            return FileType.Architecture_Documentation;
        } else if (extension === 'acm') {
            return FileType.Code_Model;
        } else if (extension === 'json' && includesTraceLinkInName) {
            return FileType.Trace_Link_JSON;
        } else if (extension === 'json' && includesInconsistenciesInName) {
            return FileType.Inconsistencies_JSON;
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
