//this function calls the ArDoCo REST Api and returns
'use client'
import {FileType} from "@/components/dataTypes/FileType";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import {TraceLinkConfiguration} from "@/components/multiStepForm/ProjectFormContext";

interface ArDoCoApiResponse {
    jsonResult: any;
    usedFiles: UploadedFile[];
}

export default async function fetchArDoCoAPI (projectName:string, selectedTraceLinkType:TraceLinkType | null, inputFiles: UploadedFile[], config?:TraceLinkConfiguration | null) : Promise<ArDoCoApiResponse> {
    console.log("Submitted data: ", projectName, selectedTraceLinkType, inputFiles);

    let result = null
    let usedFiles : UploadedFile[] = []

    if (!selectedTraceLinkType) {
        throw new Error("No selectedTraceLinkType provided");
    }

    try {
        const apiEndpoint = `/api/${selectedTraceLinkType.name.toLowerCase()}/start`;
        const requestData = new FormData();
        requestData.append("projectName", projectName);

        // filter config to exclude empty entries and convert to JSON string
        if (config) {
            const filteredConfig = Object.fromEntries(Object.entries(config).filter(([_, value]) => value !== ""));
            const configJson = JSON.stringify(filteredConfig);
            console.log(configJson)
            requestData.append("additionalConfigs", configJson);
        }

        let inputCodeFile
        let inputTextFile
        let inputArchitectureFile


        // create different form data depending on the selected tracelinktype
        switch (selectedTraceLinkType.name) {
            case 'SAD-SAM-Code':
                inputCodeFile = findFile(inputFiles, FileType.Code_Model);
                inputTextFile = findFile(inputFiles, FileType.Architecture_Documentation);
                inputArchitectureFile = findFile(inputFiles, [FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML]);
                if (!inputCodeFile || !inputTextFile || !inputArchitectureFile) {
                    throw new Error("Missing required files for SAD-SAM-CODE.");
                }

                requestData.append("inputCode", inputCodeFile.file);
                requestData.append("inputText", inputTextFile.file);
                requestData.append("inputArchitectureModel", inputArchitectureFile.file);
                requestData.append("architectureModelType", inputArchitectureFile.fileType);
                usedFiles = [inputCodeFile, inputTextFile, inputArchitectureFile]
                break;

            case 'SAD-Code':
                inputCodeFile = findFile(inputFiles, FileType.Code_Model);
                inputTextFile = findFile(inputFiles, FileType.Architecture_Documentation);
                if (!inputCodeFile || !inputTextFile) {
                    throw new Error("Missing required files for SAD-CODE.");
                }

                requestData.append("inputCode", inputCodeFile.file);
                requestData.append("inputText", inputTextFile.file);
                usedFiles = [inputCodeFile, inputTextFile]
                break;

            case 'SAM-Code':
                inputCodeFile = findFile(inputFiles, FileType.Code_Model);
                inputArchitectureFile = findFile(inputFiles, [FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML]);
                if (!inputCodeFile || !inputArchitectureFile) {
                    throw new Error("Missing required files for SAM-CODE.");
                }

                requestData.append("inputCode", inputCodeFile.file);
                requestData.append("inputArchitectureModel", inputArchitectureFile.file);
                requestData.append("architectureModelType", inputArchitectureFile.fileType);
                usedFiles = [inputCodeFile, inputArchitectureFile]
                break;

            case 'SAD-SAM':
                inputTextFile = findFile(inputFiles, FileType.Architecture_Documentation);
                inputArchitectureFile = findFile(inputFiles, [FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML]);
                if (!inputTextFile || !inputArchitectureFile) {
                    throw new Error("Missing required files for SAD-SAM.");
                }

                requestData.append("inputText", inputTextFile.file);
                requestData.append("inputArchitectureModel", inputArchitectureFile.file);
                requestData.append("architectureModelType", inputArchitectureFile.fileType);
                usedFiles = [inputTextFile, inputArchitectureFile]
                break;
            default:
                throw new Error(`Unsupported trace link type: ${selectedTraceLinkType}`);
        }

        const response = await fetch(apiEndpoint, {
            method: "POST",
            body: requestData,
        });

        if (!response.ok) {
            throw new Error("API call failed.");
        }

        result = await response.json();
        if (!result.requestId) {
            throw new Error("Invalid API response.");
        }

    } catch (error) {
        console.error("Error submitting data:", error);
    }
    return {jsonResult: result, usedFiles: usedFiles}

}


/**
 * Constructs a FormData object based on the selected trace link type and uploaded files.
 * Validates that all required files for the given trace link type are present.
 * @param traceLinkType - The selected `TraceLinkType`.
 * @param uploadedFiles - An array of `UploadedFile` objects.
 * @param projectName - The name of the project.
 * @returns A `FormData` object containing the necessary files and project name.
 * @throws {Error} If required files for the specified trace link type are missing.
 */
function buildRequestFormData(traceLinkType: TraceLinkType, uploadedFiles: UploadedFile[], projectName: string): FormData {
    const requestData = new FormData();
    requestData.append("projectName", projectName);

    let inputCodeFile: UploadedFile | undefined;
    let inputTextFile: UploadedFile | undefined;
    let inputArchitectureFile: UploadedFile | undefined;

    switch (traceLinkType.name) {
        case 'SAD-SAM-Code':
            inputCodeFile = findFile(uploadedFiles, FileType.Code_Model);
            inputTextFile = findFile(uploadedFiles, FileType.Architecture_Documentation);
            inputArchitectureFile = findFile(uploadedFiles, [FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML]);
            if (!inputCodeFile || !inputTextFile || !inputArchitectureFile) {
                throw new Error("Missing required files for SAD-SAM-CODE: Code Model, Architecture Documentation, and Architecture Model.");
            }
            requestData.append("inputCode", inputCodeFile.file);
            requestData.append("inputText", inputTextFile.file);
            requestData.append("inputArchitectureModel", inputArchitectureFile.file);
            requestData.append("architectureModelType", inputArchitectureFile.fileType);
            break;

        case 'SAD-Code':
            inputCodeFile = findFile(uploadedFiles, FileType.Code_Model);
            inputTextFile = findFile(uploadedFiles, FileType.Architecture_Documentation);
            if (!inputCodeFile || !inputTextFile) {
                throw new Error("Missing required files for SAD-CODE: Code Model and Architecture Documentation.");
            }
            requestData.append("inputCode", inputCodeFile.file);
            requestData.append("inputText", inputTextFile.file);
            break;

        case 'SAM-Code':
            inputCodeFile = findFile(uploadedFiles, FileType.Code_Model);
            inputArchitectureFile = findFile(uploadedFiles, [FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML]);
            if (!inputCodeFile || !inputArchitectureFile) {
                throw new Error("Missing required files for SAM-CODE: Code Model and Architecture Model.");
            }
            requestData.append("inputCode", inputCodeFile.file);
            requestData.append("inputArchitectureModel", inputArchitectureFile.file);
            requestData.append("architectureModelType", inputArchitectureFile.fileType);
            break;

        case 'SAD-SAM':
            inputTextFile = findFile(uploadedFiles, FileType.Architecture_Documentation);
            inputArchitectureFile = findFile(uploadedFiles, [FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML]);
            if (!inputTextFile || !inputArchitectureFile) {
                throw new Error("Missing required files for SAD-SAM: Architecture Documentation and Architecture Model.");
            }
            requestData.append("inputText", inputTextFile.file);
            requestData.append("inputArchitectureModel", inputArchitectureFile.file);
            requestData.append("architectureModelType", inputArchitectureFile.fileType);
            break;

        default:
            throw new Error(`Unsupported trace link type: ${traceLinkType.name}`);
    }

    return requestData;
}

/**
 * Finds the first file in the uploaded files array that matches one of the specified file types.
 * @param uploadedFiles - An array of `UploadedFile` objects.
 * @param fileTypes - A single `FileType` or an array of `FileType` values to search for.
 */
function findFile(uploadedFiles: UploadedFile[], fileTypes: FileType | FileType[]): UploadedFile | undefined {
    const fileTypeArray = Array.isArray(fileTypes) ? fileTypes : [fileTypes];
    return uploadedFiles.find((file) => fileTypeArray.includes(file.fileType));
}

