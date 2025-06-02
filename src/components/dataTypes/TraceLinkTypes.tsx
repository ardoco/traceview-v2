import { FileType } from "@/components/dataTypes/FileType";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {ResultPanelType} from "@/components/dataTypes/ResultPanelType";


export interface TraceLinkType {
    name: string;
    info: string; // Additional information about the option
    checkCondition: (uploadedFiles: UploadedFile[]) => boolean; // Determines if the option is selectable
    providedFiles: FileType[]; // The file types that are provided when this option is selected
    resultViewOptions: ResultPanelType[]; // The options for the result view
}

export const TraceLinkTypes: Record<string, TraceLinkType> = {
    "SAD-SAM-Code": {
        name: "SAD-SAM-Code",
        info: "Finds transitive traceLinks between Software Architecture Documentation (SAD) and the code via the Software Architecture Model (SAM)",
        checkCondition: (uploadedFiles: UploadedFile[]) =>
            hasArchitectureModel(uploadedFiles) && hasCodeModel(uploadedFiles) && hasArchitectureDocumentation(uploadedFiles),
        providedFiles: [FileType.Architecture_Documentation, FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML, FileType.Code_Model],
        resultViewOptions: [ResultPanelType.Raw_JSON, ResultPanelType.Code_Model, ResultPanelType.Architecture_Model, ResultPanelType.Documentation],

    },
    "SAD-SAM": {
        name: "SAD-SAM",
        info: "Finds traceLinks between the Software Architecture Documentation (SAD) and the uploaded Software Architecture Model (SAM)",
        checkCondition: (uploadedFiles: UploadedFile[]) =>
            hasArchitectureDocumentation(uploadedFiles) && hasArchitectureModel(uploadedFiles),
        providedFiles: [FileType.Architecture_Documentation, FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML],
        resultViewOptions: [ResultPanelType.Raw_JSON, ResultPanelType.Architecture_Model, ResultPanelType.Documentation],
    },
    "SAD-Code": {
        name: "SAD-Code",
        info: "Finds traceLinks between the Software Architecture Documentation (SAD) and the uploaded code",
        checkCondition: (uploadedFiles: UploadedFile[]) =>
            hasArchitectureDocumentation(uploadedFiles) && hasCodeModel(uploadedFiles),
        providedFiles: [FileType.Architecture_Documentation, FileType.Code_Model],
        resultViewOptions: [ResultPanelType.Raw_JSON, ResultPanelType.Code_Model, ResultPanelType.Documentation],
    },
    "SAM-Code": {
        name: "SAM-Code",
        info: "Finds traceLinks between the Software Architecture Model (SAM) and the uploaded code",
        checkCondition: (uploadedFiles: UploadedFile[]) =>
            hasArchitectureModel(uploadedFiles) && hasCodeModel(uploadedFiles),
        providedFiles: [FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML, FileType.Code_Model],
        resultViewOptions: [ResultPanelType.Raw_JSON, ResultPanelType.Code_Model, ResultPanelType.Architecture_Model],
    },
};

// Helper function to access all available TraceLinkTypes
export function getTraceLinkTypes(): TraceLinkType[] {
    return Object.values(TraceLinkTypes);
}


// export function getTraceLinkTypes(): TraceLinkType[] {
//     return [
//         {
//             name: "SAD-SAM-Code",
//             info: "Finds transitive traceLinks between Software Architecture Documentation (SAD) and the code via the Software Architecture Model (SAM)",
//             checkCondition: (uploadedFiles: UploadedFile[]) => {
//                 return (uploadedFiles) && hasArchitectureModel(uploadedFiles) && hasCodeModel(uploadedFiles) && hasArchitectureDocumentation(uploadedFiles)
//             },
//             providedFiles: [FileType.Architecture_Documentation, FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML, FileType.Code_Model],
//         },
//         {
//             name: "SAD-SAM",
//             info: "Finds traceLinks between the Software Architecture Documentation (SAD) and the uploaded Software Architecture Model (SAM)",
//             checkCondition: (uploadedFiles: UploadedFile[]) => {
//                 return (uploadedFiles) && hasArchitectureDocumentation(uploadedFiles) && hasArchitectureModel(uploadedFiles)
//             },
//             providedFiles: [FileType.Architecture_Documentation, FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML],
//         },
//         {
//             name: "SAD-Code",
//             info: "Finds traceLinks between the Software Architecture Documentation (SAD) and the uploaded code",
//             checkCondition: (uploadedFiles: UploadedFile[]) => {
//                 return (uploadedFiles) && hasArchitectureDocumentation(uploadedFiles) && hasCodeModel(uploadedFiles)
//             },
//             providedFiles: [FileType.Architecture_Documentation, FileType.Code_Model],
//         },
//         {
//             name: "SAM-Code",
//             info: "Finds traceLinks between the Software Architecture Model (SAM) and the uploaded code",
//             checkCondition: (uploadedFiles: UploadedFile[]) => {
//                 return (uploadedFiles) && hasArchitectureModel(uploadedFiles) && hasCodeModel(uploadedFiles)
//             },
//             providedFiles: [FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML, FileType.Code_Model],
//         },
//     ];
// }

// Helper functions to check specific conditions
const hasArchitectureDocumentation = (files: UploadedFile[]): boolean =>
    files.some(file => file.fileType === FileType.Architecture_Documentation);

const hasArchitectureModel = (files: UploadedFile[]): boolean =>
    files.some(file => file.fileType === FileType.Architecture_Model_PCM || file.fileType === FileType.Architecture_Model_UML);

const hasCodeModel = (files: UploadedFile[]): boolean =>
    files.some(file => file.fileType === FileType.Code_Model);
