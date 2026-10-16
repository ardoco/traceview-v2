'use client'
import {FileType} from "@/components/dataTypes/FileType";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {TraceLinkType, TraceLinkTypes} from "@/components/dataTypes/TraceLinkTypes";
import {TraceLinkConfiguration} from "@/contexts/ProjectUploadContext";

export interface StartRunResponse {
    requestId: string;
    [key: string]: unknown;
}

interface ArdocoApiResponse {
    jsonResult: StartRunResponse;
    usedFiles: UploadedFile[];
    // Request id of the inconsistency detection. Equals jsonResult.requestId for SWATTR (same run),
    // a separate id for the other trace link types, and undefined if no inconsistencies were requested.
    inconsistencyRequestId?: string;
    // Set if the separate inconsistency detection could not be started.
    inconsistencyError?: string;
}

export default async function fetchArdocoApi(apiAddress: string, projectName: string, selectedTraceLinkType: TraceLinkType | null, inputFiles: UploadedFile[], findInconsistencies: boolean, config?: TraceLinkConfiguration | null): Promise<ArdocoApiResponse> {

    let usedFiles: UploadedFile[] = []

    if (!selectedTraceLinkType) {
        throw new Error("No selectedTraceLinkType provided");
    }

    const isSadSam = selectedTraceLinkType.name === TraceLinkTypes.SAD_SAM.name;

    // SWATTR with inconsistencies is a single run that returns trace links and inconsistencies.
    let apiEndpoint = `/api/${selectedTraceLinkType.api_name.toLowerCase()}/start`;
    if (findInconsistencies && isSadSam) {
        apiEndpoint = INCONSISTENCY_ENDPOINT;
    }

    const requestData = createBaseFormData(projectName, config);

    let inputCodeFile
    let inputTextFile
    let inputArchitectureFile

    // create different form data depending on the selected traceLinkType
    switch (selectedTraceLinkType.name) {
        case TraceLinkTypes.SAD_SAM_CODE.name:
            inputCodeFile = findFile(inputFiles, FileType.CODE_MODEL);
            inputTextFile = findFile(inputFiles, FileType.DOCUMENTATION);
            inputArchitectureFile = findFile(inputFiles, [FileType.ARCHITECTURE_MODEL_PCM, FileType.ARCHITECTURE_MODEL_UML]);
            if (!inputCodeFile || !inputTextFile || !inputArchitectureFile) {
                throw new Error("Missing required files for " + TraceLinkTypes.SAD_SAM_CODE.name + ".");
            }

            requestData.append("inputCode", inputCodeFile.file);
            requestData.append("inputText", inputTextFile.file);
            requestData.append("inputArchitectureModel", inputArchitectureFile.file);
            requestData.append("inputArchitectureModelFormat", inputArchitectureFile.fileType);
            usedFiles = [inputCodeFile, inputTextFile, inputArchitectureFile]
            break;

        case TraceLinkTypes.SAD_CODE.name:
            inputCodeFile = findFile(inputFiles, FileType.CODE_MODEL);
            inputTextFile = findFile(inputFiles, FileType.DOCUMENTATION);
            if (!inputCodeFile || !inputTextFile) {
                throw new Error("Missing required files for " + TraceLinkTypes.SAD_CODE.name + ".");
            }

            requestData.append("inputCode", inputCodeFile.file);
            requestData.append("inputText", inputTextFile.file);
            usedFiles = [inputCodeFile, inputTextFile]
            break;

        case TraceLinkTypes.SAM_CODE.name:
            inputCodeFile = findFile(inputFiles, FileType.CODE_MODEL);
            inputArchitectureFile = findFile(inputFiles, [FileType.ARCHITECTURE_MODEL_PCM, FileType.ARCHITECTURE_MODEL_UML]);
            if (!inputCodeFile || !inputArchitectureFile) {
                throw new Error("Missing required files for " + TraceLinkTypes.SAM_CODE.name + ".");
            }

            requestData.append("inputCode", inputCodeFile.file);
            requestData.append("inputArchitectureModel", inputArchitectureFile.file);
            requestData.append("inputArchitectureModelFormat", inputArchitectureFile.fileType);
            usedFiles = [inputCodeFile, inputArchitectureFile]
            break;

        case TraceLinkTypes.SAD_SAM.name:
            inputTextFile = findFile(inputFiles, FileType.DOCUMENTATION);
            inputArchitectureFile = findFile(inputFiles, [FileType.ARCHITECTURE_MODEL_PCM, FileType.ARCHITECTURE_MODEL_UML]);
            if (!inputTextFile || !inputArchitectureFile) {
                throw new Error("Missing required files for " + TraceLinkTypes.SAD_SAM.name + ".");
            }

            requestData.append("inputText", inputTextFile.file);
            requestData.append("inputArchitectureModel", inputArchitectureFile.file);
            requestData.append("inputArchitectureModelFormat", inputArchitectureFile.fileType);
            usedFiles = [inputTextFile, inputArchitectureFile]
            break;
        default:
            throw new Error(`Unsupported trace link type: ${selectedTraceLinkType}`);
    }

    if (!findInconsistencies || isSadSam) {
        const result = await startRun(apiAddress, apiEndpoint, requestData);
        return {jsonResult: result, usedFiles: usedFiles, inconsistencyRequestId: findInconsistencies ? result.requestId : undefined};
    }

    // Other trace link types: start a separate SAD-SAM inconsistency detection alongside the main run,
    // with the same documentation, architecture model and configuration.
    const sadFile = findFile(inputFiles, FileType.DOCUMENTATION);
    const samFile = findFile(inputFiles, [FileType.ARCHITECTURE_MODEL_PCM, FileType.ARCHITECTURE_MODEL_UML]);
    if (!sadFile || !samFile) {
        throw new Error("Finding inconsistencies requires documentation and an architecture model.");
    }
    const inconsistencyData = createBaseFormData(projectName, config);
    inconsistencyData.append("inputText", sadFile.file);
    inconsistencyData.append("inputArchitectureModel", samFile.file);
    inconsistencyData.append("inputArchitectureModelFormat", samFile.fileType);

    const [mainRun, inconsistencyRun] = await Promise.allSettled([
        startRun(apiAddress, apiEndpoint, requestData),
        startRun(apiAddress, INCONSISTENCY_ENDPOINT, inconsistencyData),
    ]);
    if (mainRun.status === "rejected") {
        throw mainRun.reason;
    }

    // The result view needs the documentation and the architecture model to show the inconsistencies.
    for (const file of [sadFile, samFile]) {
        if (!usedFiles.includes(file)) {
            usedFiles.push(file);
        }
    }

    if (inconsistencyRun.status === "rejected") {
        console.error("Could not start the inconsistency detection:", inconsistencyRun.reason);
        return {
            jsonResult: mainRun.value,
            usedFiles: usedFiles,
            inconsistencyError: inconsistencyRun.reason instanceof Error ? inconsistencyRun.reason.message : String(inconsistencyRun.reason),
        };
    }
    return {jsonResult: mainRun.value, usedFiles: usedFiles, inconsistencyRequestId: inconsistencyRun.value.requestId};
}

const INCONSISTENCY_ENDPOINT = "/api/find-inconsistencies/start";

function createBaseFormData(projectName: string, config?: TraceLinkConfiguration | null): FormData {
    const formData = new FormData();
    formData.append("projectName", projectName);

    // filter config to exclude empty entries and convert to JSON string
    if (config) {
        const filteredConfig = Object.fromEntries(Object.entries(config).filter(([, value]) => value !== ""));
        formData.append("additionalConfigs", JSON.stringify(filteredConfig));
    }
    return formData;
}

async function startRun(apiAddress: string, apiEndpoint: string, requestData: FormData): Promise<StartRunResponse> {
    try {
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

        const result = await response.json();
        if (!result.requestId) {
            throw new Error("Invalid API response.");
        }
        return result;
    } catch (error) {
        throw new Error(`API call failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
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

