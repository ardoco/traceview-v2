//this function calls the ArDoCo REST Api and returns
'use client'
import {FileType} from "@/components/dataTypes/FileType";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";

export default async function fetchArDoCoAPI (projectName:string, selectedTraceLinkType:TraceLinkType | null, uploadedFiles: UploadedFile[]) {
    console.log("Submitted data: ", projectName, selectedTraceLinkType, uploadedFiles);

    let result = null

    if (!selectedTraceLinkType) {
        throw new Error("No selectedTraceLinkType provided");
    }

    try {
        const apiEndpoint = `/api/${selectedTraceLinkType.name.toLowerCase()}/start`;
        const requestData = new FormData();
        requestData.append("projectName", projectName);

        let inputCodeFile
        let inputTextFile
        let inputArchitectureFile


        // create different form data depending on the selected tracelinktype
        switch (selectedTraceLinkType.name) {
            case 'SAD-SAM-Code':
                inputCodeFile = findFile(uploadedFiles, FileType.Code_Model);
                inputTextFile = findFile(uploadedFiles, FileType.Architecture_Documentation);
                inputArchitectureFile = findFile(
                    uploadedFiles,
                    [FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML]
                );

                if (!inputCodeFile || !inputTextFile || !inputArchitectureFile) {
                    throw new Error("Missing required files for SAD-SAM-CODE.");
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
                    throw new Error("Missing required files for SAD-CODE.");
                }

                requestData.append("inputCode", inputCodeFile.file);
                requestData.append("inputText", inputTextFile.file);
                break;

            case 'SAM-Code':
                inputCodeFile = findFile(uploadedFiles, FileType.Code_Model);
                inputArchitectureFile = findFile(
                    uploadedFiles,
                    [FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML]
                );

                if (!inputCodeFile || !inputArchitectureFile) {
                    throw new Error("Missing required files for SAM-CODE.");
                }

                requestData.append("inputCode", inputCodeFile.file);
                requestData.append("inputArchitectureModel", inputArchitectureFile.file);
                requestData.append("architectureModelType", inputArchitectureFile.fileType);
                break;

            case 'SAD-SAM':
                inputTextFile = findFile(uploadedFiles, FileType.Architecture_Documentation);
                inputArchitectureFile = findFile(
                    uploadedFiles,
                    [FileType.Architecture_Model_PCM, FileType.Architecture_Model_UML]
                );

                if (!inputTextFile || !inputArchitectureFile) {
                    throw new Error("Missing required files for SAD-SAM.");
                }

                requestData.append("inputText", inputTextFile.file);
                requestData.append("inputArchitectureModel", inputArchitectureFile.file);
                requestData.append("architectureModelType", inputArchitectureFile.fileType);
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
        console.log(result);
        if (!result.requestId) {
            throw new Error("Invalid API response.");
        }

        console.log(inputCodeFile, inputTextFile, inputArchitectureFile)
        await storeProjectFiles(result.requestId, uploadedFiles);

    } catch (error) {
        console.error("Error submitting data:", error);
    }
    return result

}

// Helper function to find the first file that matches one of the given file types
function findFile(uploadedFiles: UploadedFile[], fileTypes: FileType | FileType[]): UploadedFile | undefined {
    const fileTypeArray = Array.isArray(fileTypes) ? fileTypes : [fileTypes];
    return uploadedFiles.find((file) => fileTypeArray.includes(file.fileType));
}

async function storeProjectFiles(projectId: string, uploadedFiles: UploadedFile[]) {
    if (typeof window === "undefined") {
        throw new Error("This function must be executed on the client side.");
    }
    const fsHandle = await navigator.storage.getDirectory();// get the root directory where files can be stored
    const projectDirHandle = await fsHandle.getDirectoryHandle(projectId, { create: true });// create a directory for the project

    for (const uploadedFile of uploadedFiles) {
        await storeProjectFile(projectDirHandle, uploadedFile);
    }

    // @ts-ignore
    for await (const [key, value] of projectDirHandle.entries()) { // log which files have been stored
        console.log({ key, value}, await value.getFile());
    }
}

async function storeProjectFile(projectDirHandle: FileSystemDirectoryHandle, file: UploadedFile) {
    const fileName = file.fileType === FileType.Architecture_Model_PCM || file.fileType === FileType.Architecture_Model_UML
        ? "Architecture Model"
        : file.fileType;

    // Store the actual file
    const fileHandle = await projectDirHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(file.file);
    await writable.close();

    // Store metadata file (e.g., file type)
    const metaHandle = await projectDirHandle.getFileHandle(`${fileName}.meta.json`, { create: true });
    const metaWritable = await metaHandle.createWritable();
    await metaWritable.write(JSON.stringify({ fileType: file.fileType }));
    await metaWritable.close();
}


export async function loadProjectFile(projectId: string, fallbackType: FileType): Promise<UploadedFile | null> {
    if (typeof window === "undefined") {
        throw new Error("This function must be executed on the client side.");
    }

    try {
        const fsHandle = await navigator.storage.getDirectory(); // get the root directory where files can be stored
        const projectDirHandle = await fsHandle.getDirectoryHandle(projectId, { create: true }); // create a directory for the project

        const fileName = fallbackType === FileType.Architecture_Model_PCM || fallbackType === FileType.Architecture_Model_UML
            ? "Architecture Model"
            : fallbackType;

        const fileHandle = await projectDirHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();

        // Try to read the .meta.json file to determine specific fileType
        let actualFileType = fallbackType;
        try {
            const metaHandle = await projectDirHandle.getFileHandle(`${fileName}.meta.json`);
            const metaFile = await metaHandle.getFile();
            const metaText = await metaFile.text();
            const meta = JSON.parse(metaText);
            actualFileType = meta.fileType ?? fallbackType;
        } catch {
            console.warn("Metadata not found for file:", fileName);
        }

        return { fileType: actualFileType, file };

    } catch( error) {
        // @ts-ignore
        if (error.name === "NotFoundError") {
            console.log("File not found: ", error);
            return null;
        }
        throw error;
    }
}
