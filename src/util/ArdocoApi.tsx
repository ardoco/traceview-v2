'use client'
import {FileType} from "@/components/dataTypes/FileType";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {TraceLinkType, TraceLinkTypes} from "@/components/dataTypes/TraceLinkTypes";
import {TraceLinkConfiguration} from "@/contexts/ProjectFormContext";

interface ArDoCoApiResponse {
    jsonResult: any;
    usedFiles: UploadedFile[];
}

export default async function fetchArDoCoAPI(apiAddress: string, projectName: string, selectedTraceLinkType: TraceLinkType | null, inputFiles: UploadedFile[], findInconsistencies: boolean, config?: TraceLinkConfiguration | null): Promise<ArDoCoApiResponse> {
    console.log("Submitted data: ", projectName, selectedTraceLinkType, inputFiles);

    let result = null
    let usedFiles: UploadedFile[] = []

    if (!selectedTraceLinkType) {
        throw new Error("No selectedTraceLinkType provided");
    }

    if (findInconsistencies && selectedTraceLinkType.name !== TraceLinkTypes.SAD_SAM.name) {
        throw new Error(`Find inconsistencies is only supported for ${TraceLinkTypes.SAD_SAM.name} trace link type.`);
    }

    let apiEndpoint = `/api/${selectedTraceLinkType.api_name.toLowerCase()}/start`;
    if (findInconsistencies) {
        apiEndpoint = `/api/find-inconsistencies/start`;
    }

    const requestData = new FormData();
    requestData.append("projectName", projectName);

    // filter config to exclude empty entries and convert to JSON string
    if (config) {
        const filteredConfig = Object.fromEntries(Object.entries(config).filter(([_, value]) => value !== ""));
        const configJson = JSON.stringify(filteredConfig);
        requestData.append("additionalConfigs", configJson);
    }

    let inputCodeFile
    let inputTextFile
    let inputArchitectureFile

    // create different form data depending on the selected tracelinktype
    switch (selectedTraceLinkType.name) {
        case TraceLinkTypes.SAD_SAM_CODE.name:
            inputCodeFile = findFile(inputFiles, FileType.Code_Model);
            inputTextFile = findFile(inputFiles, FileType.Architecture_Documentation);
            inputArchitectureFile = findFile(inputFiles, [FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML]);
            if (!inputCodeFile || !inputTextFile || !inputArchitectureFile) {
                throw new Error("Missing required files for " + TraceLinkTypes.SAD_SAM_CODE.name + ".");
            }

            requestData.append("inputCode", inputCodeFile.file);
            requestData.append("inputText", inputTextFile.file);
            requestData.append("inputArchitectureModel", inputArchitectureFile.file);
            requestData.append("architectureModelType", inputArchitectureFile.fileType);
            usedFiles = [inputCodeFile, inputTextFile, inputArchitectureFile]
            break;

        case TraceLinkTypes.SAD_CODE.name:
            inputCodeFile = findFile(inputFiles, FileType.Code_Model);
            inputTextFile = findFile(inputFiles, FileType.Architecture_Documentation);
            if (!inputCodeFile || !inputTextFile) {
                throw new Error("Missing required files for " + TraceLinkTypes.SAD_CODE.name + ".");
            }

            requestData.append("inputCode", inputCodeFile.file);
            requestData.append("inputText", inputTextFile.file);
            usedFiles = [inputCodeFile, inputTextFile]
            break;

        case TraceLinkTypes.SAM_CODE.name:
            inputCodeFile = findFile(inputFiles, FileType.Code_Model);
            inputArchitectureFile = findFile(inputFiles, [FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML]);
            if (!inputCodeFile || !inputArchitectureFile) {
                throw new Error("Missing required files for " + TraceLinkTypes.SAM_CODE.name + ".");
            }

            requestData.append("inputCode", inputCodeFile.file);
            requestData.append("inputArchitectureModel", inputArchitectureFile.file);
            requestData.append("architectureModelType", inputArchitectureFile.fileType);
            usedFiles = [inputCodeFile, inputArchitectureFile]
            break;

        case TraceLinkTypes.SAD_SAM.name:
            inputTextFile = findFile(inputFiles, FileType.Architecture_Documentation);
            inputArchitectureFile = findFile(inputFiles, [FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML]);
            if (!inputTextFile || !inputArchitectureFile) {
                throw new Error("Missing required files for " + TraceLinkTypes.SAD_SAM.name + ".");
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
        headers: {
            'X-Target-API': apiAddress,
        },
    });

    if (!response.ok) {
        throw new Error("API call failed.");
    }

    result = await response.json();
    if (!result.requestId) {
        throw new Error("Invalid API response.");
    }
    return {jsonResult: result, usedFiles: usedFiles}
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

