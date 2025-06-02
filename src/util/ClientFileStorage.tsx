'use client'

import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {FileType} from "@/components/dataTypes/FileType";

export async function storeProjectFiles(projectId: string, uploadedFiles: UploadedFile[]) {
    if (typeof window === "undefined") {
        throw new Error("This function must be executed on the client side.");
    }
    const fsHandle = await navigator.storage.getDirectory();// get the root directory where files can be stored
    const projectDirHandle = await fsHandle.getDirectoryHandle(projectId, {create: true});// create a directory for the project

    for (const uploadedFile of uploadedFiles) {
        await storeProjectFile(projectDirHandle, uploadedFile);
    }

    // @ts-ignore
    for await (const [key, value] of projectDirHandle.entries()) { // log which files have been stored
        console.log({key, value}, await value.getFile());
    }
}

async function storeProjectFile(projectDirHandle: FileSystemDirectoryHandle, file: UploadedFile) {
    const fileName = file.fileType === FileType.Architecture_Model_PCM || file.fileType === FileType.Architecture_Model_UML
        ? "Architecture Model"
        : file.fileType;

    // Store the actual file
    const fileHandle = await projectDirHandle.getFileHandle(fileName, {create: true});
    const writable = await fileHandle.createWritable();
    await writable.write(file.file);
    await writable.close();

    // Store metadata file (e.g., file type)
    const metaHandle = await projectDirHandle.getFileHandle(`${fileName}.meta.json`, {create: true});
    const metaWritable = await metaHandle.createWritable();
    await metaWritable.write(JSON.stringify({fileType: file.fileType}));
    await metaWritable.close();
}

export async function loadProjectFile(projectId: string, fallbackType: FileType): Promise<UploadedFile | null> {
    if (typeof window === "undefined") {
        throw new Error("This function must be executed on the client side.");
    }
    try {
        const fsHandle = await navigator.storage.getDirectory(); // get the root directory where files can be stored
        const projectDirHandle = await fsHandle.getDirectoryHandle(projectId, {create: true}); // create a directory for the project

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

        return {fileType: actualFileType, file};

    } catch (error) {
        // @ts-ignore
        if (error.name === "NotFoundError") {
            console.log("File not found: ", error);
            return null;
        }
        throw error;
    }
}