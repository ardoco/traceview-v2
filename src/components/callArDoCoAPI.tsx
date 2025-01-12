import {FileType, UploadedFile} from "@/components/drag-and-drop/FileListItem";


//this function calls the ArDoCo REST Api and returns
export default async function fetchArDoCoAPI (projectName:string, selectedTraceLinkType:string | null, uploadedFiles: UploadedFile[]) {
    console.log("Submitted data: ", projectName, selectedTraceLinkType, uploadedFiles);

    let result = null

    if (!selectedTraceLinkType) {
        throw new Error("No selectedTraceLinkType provided");
    }

    try {
        const apiEndpoint = `/api/${selectedTraceLinkType.toLowerCase()}/start`;
        const requestData = new FormData();
        requestData.append("projectName", projectName);

        let inputCodeFile
        let inputTextFile
        let inputArchitectureFile


        // create different form data depending on the selected tracelinktype
        switch (selectedTraceLinkType) {
            case 'sad-sam-code':
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

            case 'sad-code':
                inputCodeFile = findFile(uploadedFiles, FileType.Code_Model);
                inputTextFile = findFile(uploadedFiles, FileType.Architecture_Documentation);

                if (!inputCodeFile || !inputTextFile) {
                    throw new Error("Missing required files for SAD-CODE.");
                }

                requestData.append("inputCode", inputCodeFile.file);
                requestData.append("inputText", inputTextFile.file);
                break;

            case 'sam-code':
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

            case 'sad-sam':
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