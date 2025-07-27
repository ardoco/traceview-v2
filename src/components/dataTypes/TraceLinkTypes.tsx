import { FileType } from "@/components/dataTypes/FileType";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {ResultPanelType} from "@/components/dataTypes/ResultPanelType";


export interface TraceLinkType {
    name: string;
    api_name: string; // The name used in the API, which may differ from the display name
    info: string; // Additional information about the option
    checkCondition: (uploadedFiles: UploadedFile[]) => boolean; // Determines if the option is selectable
    providedFiles: FileType[]; // The file types that are provided when this option is selected
    resultViewOptions: ResultPanelType[]; // The options for the result view
}

export const TraceLinkTypes: Record<string, TraceLinkType> = {
    "SAD_SAM_CODE": {
        name: "SAD_SAM_CODE",
        api_name: "SAD-SAM-Code",
        info: "Finds transitive traceLinks between Software Architecture Documentation (SAD) and the code via the Software Architecture Model (SAM)",
        checkCondition: (uploadedFiles: UploadedFile[]) =>
            hasArchitectureModel(uploadedFiles) && hasCodeModel(uploadedFiles) && hasArchitectureDocumentation(uploadedFiles),
        providedFiles: [FileType.Architecture_Documentation, FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML, FileType.Code_Model],
        resultViewOptions: [ResultPanelType.Code_Model, ResultPanelType.Architecture_Model, ResultPanelType.Documentation],

    },
    "SAD_SAM": {
        name: "SAD_SAM",
        api_name: "SAD-SAM",
        info: "Finds traceLinks between the Software Architecture Documentation (SAD) and the uploaded Software Architecture Model (SAM)",
        checkCondition: (uploadedFiles: UploadedFile[]) =>
            hasArchitectureDocumentation(uploadedFiles) && hasArchitectureModel(uploadedFiles),
        providedFiles: [FileType.Architecture_Documentation, FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML],
        resultViewOptions: [ResultPanelType.Architecture_Model, ResultPanelType.Documentation],
    },
    "SAD_CODE": {
        name: "SAD_CODE",
        api_name: "SAD-Code",
        info: "Finds traceLinks between the Software Architecture Documentation (SAD) and the uploaded code",
        checkCondition: (uploadedFiles: UploadedFile[]) =>
            hasArchitectureDocumentation(uploadedFiles) && hasCodeModel(uploadedFiles),
        providedFiles: [FileType.Architecture_Documentation, FileType.Code_Model],
        resultViewOptions: [ResultPanelType.Code_Model, ResultPanelType.Documentation],
    },
    "SAM_CODE": {
        name: "SAM_CODE",
        api_name: "SAM-Code",
        info: "Finds traceLinks between the Software Architecture Model (SAM) and the uploaded code",
        checkCondition: (uploadedFiles: UploadedFile[]) =>
            hasArchitectureModel(uploadedFiles) && hasCodeModel(uploadedFiles),
        providedFiles: [FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML, FileType.Code_Model],
        resultViewOptions: [ResultPanelType.Code_Model, ResultPanelType.Architecture_Model],
    },
};

// Helper function to access all available TraceLinkTypes
export function getTraceLinkTypes(): TraceLinkType[] {
    return Object.values(TraceLinkTypes);
}

// Helper functions to check specific conditions
const hasArchitectureDocumentation = (files: UploadedFile[]): boolean =>
    files.some(file => file.fileType === FileType.Architecture_Documentation);

const hasArchitectureModel = (files: UploadedFile[]): boolean =>
    files.some(file => file.fileType === FileType.Architecture_Model_PCM || file.fileType === FileType.Architecture_Model_UML);

const hasCodeModel = (files: UploadedFile[]): boolean =>
    files.some(file => file.fileType === FileType.Code_Model);
