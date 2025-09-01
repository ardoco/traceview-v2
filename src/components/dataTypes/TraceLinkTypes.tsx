import {FileType} from "@/components/dataTypes/FileType";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {ResultType} from "@/components/dataTypes/ResultType";


export interface TraceLinkType {
    name: string;
    alternative_name: string; // old name
    api_name: string;
    info: string;
    checkCondition: (uploadedFiles: UploadedFile[]) => boolean; // Determines if the option is selectable
    providedFiles: FileType[];
    resultViewOptions: ResultType[]; // The options for the result view
}

export const TraceLinkTypes: Record<string, TraceLinkType> = {
    "SAD_SAM_CODE": {
        name: "TransArC",
        alternative_name: "sad-sam-code",
        api_name: "TransArC",
        info: "Finds transitive traceLinks between Software Architecture Documentation (SAD) and the code via the Software Architecture Model (SAM)",
        checkCondition: (uploadedFiles: UploadedFile[]) =>
            hasArchitectureModel(uploadedFiles) && hasCodeModel(uploadedFiles) && hasArchitectureDocumentation(uploadedFiles),
        providedFiles: [FileType.Architecture_Documentation, FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML, FileType.Code_Model],
        resultViewOptions: [ResultType.Code_Model, ResultType.Architecture_Model, ResultType.Documentation],

    },
    "SAD_SAM": {
        name: "SWATTR",
        alternative_name: "sad-sam",
        api_name: "SWATTR",
        info: "Finds traceLinks between the Software Architecture Documentation (SAD) and the uploaded Software Architecture Model (SAM)",
        checkCondition: (uploadedFiles: UploadedFile[]) =>
            hasArchitectureDocumentation(uploadedFiles) && hasArchitectureModel(uploadedFiles),
        providedFiles: [FileType.Architecture_Documentation, FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML],
        resultViewOptions: [ResultType.Architecture_Model, ResultType.Documentation],
    },
    "SAD_CODE": {
        name: "ArDoCode",
        alternative_name: "sad-code",
        api_name: "ArDoCode",
        info: "Finds traceLinks between the Software Architecture Documentation (SAD) and the uploaded code",
        checkCondition: (uploadedFiles: UploadedFile[]) =>
            hasArchitectureDocumentation(uploadedFiles) && hasCodeModel(uploadedFiles),
        providedFiles: [FileType.Architecture_Documentation, FileType.Code_Model],
        resultViewOptions: [ResultType.Code_Model, ResultType.Documentation],
    },
    "SAM_CODE": {
        name: "ArCoTL",
        alternative_name: "sam-code",
        api_name: "ArCoTL",
        info: "Finds traceLinks between the Software Architecture Model (SAM) and the uploaded code",
        checkCondition: (uploadedFiles: UploadedFile[]) =>
            hasArchitectureModel(uploadedFiles) && hasCodeModel(uploadedFiles),
        providedFiles: [FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML, FileType.Code_Model],
        resultViewOptions: [ResultType.Code_Model, ResultType.Architecture_Model],
    },
};

// Helper function to access all available TraceLinkTypes
export function getTraceLinkTypes(): TraceLinkType[] {
    return Object.values(TraceLinkTypes);
}

export function getTraceLinkTypeByName(name: string): TraceLinkType | undefined {
    return Object.values(TraceLinkTypes).find(type => type.name === name || type.alternative_name === name);
}


const hasArchitectureDocumentation = (files: UploadedFile[]): boolean =>
    files.some(file => file.fileType === FileType.Architecture_Documentation);

const hasArchitectureModel = (files: UploadedFile[]): boolean =>
    files.some(file => file.fileType === FileType.Architecture_Model_PCM || file.fileType === FileType.Architecture_Model_UML);

const hasCodeModel = (files: UploadedFile[]): boolean =>
    files.some(file => file.fileType === FileType.Code_Model);
