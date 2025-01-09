import {useFormContext} from "@/components/multi-step-form-wizard/ProjectFormContext";
import {FileType, UploadedFile} from "@/components/drag-and-drop/FileListItem";

export default class Validation {

    // validates everything relevant for the file upload view.
    static validateFiles(projectName: string, selectedTraceLinkType: string | null, uploadedFiles: UploadedFile[]) {
        let errors: string[] = [];
        console.log(uploadedFiles);

        if (!uploadedFiles || uploadedFiles.length < 2) {
            errors.push("Please upload at least two files.");
        }

        if (uploadedFiles.some((file) => file.fileType === FileType.None)) {
            errors.push("Please select a file type for each file.");
            console.log(uploadedFiles);
        }

        // Create a map to count occurrences of each file type
        const fileTypeCount = new Map<FileType, number>();

        // Count occurrences of each file type
        uploadedFiles.forEach((file) => {
            fileTypeCount.set(file.fileType, (fileTypeCount.get(file.fileType) || 0) + 1);
        });

        // Special rule: Ensure no more than one Architecture Model file (PCM/UML)
        const architectureModelCount =
            (fileTypeCount.get(FileType.Architecture_Model_UML) || 0) +
            (fileTypeCount.get(FileType.Architecture_Model_PCM) || 0);

        if (architectureModelCount > 1) {
            errors.push("Please upload no more than one file of type PCM/UML to avoid ambiguities.");
        }

        // General rule: No more than one file of other types
        fileTypeCount.forEach((count, fileType) => {
            if (
                count > 1 &&
                ![FileType.Architecture_Model_UML, FileType.Architecture_Model_PCM, FileType.None].includes(fileType)
            ) {
                errors.push(`Only one file of type ${fileType} can be uploaded.`);
            }
        });
        return errors;
    }

    static validateProjectDetails(projectName: string, selectedTraceLinkType: string | null, uploadedFiles: UploadedFile[]) {
        let errors: string[] = [];

        if (!projectName || projectName === "") {
            errors.push("Project name is required")
        }
        if (selectedTraceLinkType === null) {
             errors.push("No traceLink type could be selected. Please upload files with different types.")
        }
        return errors;
    }

    static validateSummary(projectName: string, selectedTraceLinkType: string | null, uploadedFiles: UploadedFile[]): string[] {
        const validationMethods = [
            () => Validation.validateFiles(projectName, selectedTraceLinkType, uploadedFiles),
            () => Validation.validateProjectDetails(projectName, selectedTraceLinkType, uploadedFiles),
        ];

        let errors: string[] = [];
        let stepsWithErrors: number[] = [];

        // Execute each validation method and collect errors
        validationMethods.forEach((validate, index) => {
            const stepErrors = validate();
            if (stepErrors.length > 0) {
                stepsWithErrors.push(index + 1); // Add step number (1-based index)
            }
        });

        // Generate summary message
        if (stepsWithErrors.length == 1) {
            errors.push(`You need to resolve the problems at Step ${stepsWithErrors[0]} before you can proceed.`);
        } else if (stepsWithErrors.length > 1) {
            let last_step = stepsWithErrors[stepsWithErrors.length - 1];
            let first_steps = stepsWithErrors.slice(0, stepsWithErrors.length - 1)
            errors.push(`You need to resolve the problems at ${first_steps.join(",")} and ${last_step} before you can proceed.`);
        }

        return errors;
    }

}