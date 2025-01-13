import { FileType } from "@/components/dataTypes/FileType";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";


export interface TraceLinkType {
    name: string;
    info: string; // Additional information about the option
    checkCondition: (uploadedFiles: UploadedFile[]) => boolean; // Determines if the option is selectable
    providedFiles: FileType[]; // The file types that are provided when this option is selected
}

export function getTraceLinkTypes(): TraceLinkType[] {
    return [
        {
            name: "SAD-SAM-Code",
            info: "Finds transitive traceLinks between Software Architecture Documentation (SAD) and the code via the Software Architecture Model (SAM)",
            checkCondition: (uploadedFiles: UploadedFile[]) => {
                return (uploadedFiles) && hasArchitectureModel(uploadedFiles) && hasCodeModel(uploadedFiles) && hasArchitectureDocumentation(uploadedFiles)
            },
            providedFiles: [FileType.Architecture_Documentation, FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML, FileType.Code_Model],
        },
        {
            name: "SAD-SAM",
            info: "Finds traceLinks between the Software Architecture Documentation (SAD) and the uploaded Software Architecture Model (SAM)",
            checkCondition: (uploadedFiles: UploadedFile[]) => {
                return (uploadedFiles) && hasArchitectureDocumentation(uploadedFiles) && hasArchitectureModel(uploadedFiles)
            },
            providedFiles: [FileType.Architecture_Documentation, FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML],
        },
        {
            name: "SAD-Code",
            info: "Finds traceLinks between the Software Architecture Documentation (SAD) and the uploaded code",
            checkCondition: (uploadedFiles: UploadedFile[]) => {
                return (uploadedFiles) && hasArchitectureDocumentation(uploadedFiles) && hasCodeModel(uploadedFiles)
            },
            providedFiles: [FileType.Architecture_Documentation, FileType.Code_Model],
        },
        {
            name: "SAM-Code",
            info: "Finds traceLinks between the Software Architecture Model (SAM) and the uploaded code",
            checkCondition: (uploadedFiles: UploadedFile[]) => {
                return (uploadedFiles) && hasArchitectureModel(uploadedFiles) && hasCodeModel(uploadedFiles)
            },
            providedFiles: [FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML, FileType.Code_Model],
        },
    ];
}

// Helper functions to check specific conditions
const hasArchitectureDocumentation = (files: UploadedFile[]): boolean =>
    files.some(file => file.fileType === FileType.Architecture_Documentation);

const hasArchitectureModel = (files: UploadedFile[]): boolean =>
    files.some(file => file.fileType === FileType.Architecture_Model_PCM || file.fileType === FileType.Architecture_Model_UML);

const hasCodeModel = (files: UploadedFile[]): boolean =>
    files.some(file => file.fileType === FileType.Code_Model);
