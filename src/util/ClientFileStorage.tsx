'use client'

import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {convertStringToFileType, FileType} from "@/components/dataTypes/FileType";

export async function storeProjectFiles(projectId: string, uploadedFiles: UploadedFile[]) {
    if (typeof window === "undefined") {
        throw new Error("This function must be executed on the client side.");
    }
    const fsHandle = await navigator.storage.getDirectory();// get the root directory where files can be stored
    const projectDirHandle = await fsHandle.getDirectoryHandle(projectId, {create: true});// create a directory for the project

    for (const uploadedFile of uploadedFiles) {
        await storeProjectFile(projectDirHandle, uploadedFile);
    }
}

export async function storeProjectMetadata(
    projectId: string,
    uploadedFiles: UploadedFile[]
) {
    if (typeof window === "undefined") {
        throw new Error("This function must be executed on the client side.");
    }

    const fsHandle = await navigator.storage.getDirectory();
    const projectDirHandle = await fsHandle.getDirectoryHandle(projectId, { create: true });

    // Create metadata: e.g. list file name and file type
    const metadata = uploadedFiles.map(file => ({
        fileType: file.fileType,
        storedFileName: getStoredFileName(file.fileType),
        originalName: file.file.name
    }));

    const metaHandle = await projectDirHandle.getFileHandle(`project.meta.json`, { create: true });
    const metaWritable = await metaHandle.createWritable();
    await metaWritable.write(JSON.stringify(metadata, null, 2));
    await metaWritable.close();
}


async function storeProjectFile(projectDirHandle: FileSystemDirectoryHandle, file: UploadedFile) {
    const fileName = getStoredFileName(file.fileType);

    // Store the actual file
    const fileHandle = await projectDirHandle.getFileHandle(fileName, {create: true});
    const writable = await fileHandle.createWritable();
    await writable.write(file.file);
    await writable.close();
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
            const metaHandle = await projectDirHandle.getFileHandle(`project.meta.json`);
            const metaFile = await metaHandle.getFile();
            const text = await metaFile.text();
            const metadata:any[] =  JSON.parse(text);
            const fileMeta = metadata.find(m => m.storedFileName === fileName);
            actualFileType = fileMeta ? convertStringToFileType(fileMeta.fileType) : fallbackType;
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

export async function loadProjectMetaData(projectId: string) {
    if (typeof window === "undefined") {
        throw new Error("This function must be executed on the client side.");
    }

    const fsHandle = await navigator.storage.getDirectory();
    const projectDirHandle = await fsHandle.getDirectoryHandle(projectId);

    const metaHandle = await projectDirHandle.getFileHandle(`project.meta.json`);
    const metaFile = await metaHandle.getFile();
    const text = await metaFile.text();
    const metadata:any[] =  JSON.parse(text);
    const allFileTypes: FileType[] = metadata.map(m =>
        convertStringToFileType(m.fileType)
    );
    return allFileTypes
}

/**
 * Delete a specific file from a project.
 * Also removes its metadata entry and updates the metadata file.
 */
export async function deleteProjectFile(projectId: string, fileType: FileType) {
    if (typeof window === "undefined") {
        throw new Error("This function must be executed on the client side.");
    }

    const fsHandle = await navigator.storage.getDirectory();
    const projectDirHandle = await fsHandle.getDirectoryHandle(projectId);

    const fileName = getStoredFileName(fileType);

    // Load metadata BEFORE deleting
    const metaHandle = await projectDirHandle.getFileHandle(`project.meta.json`);
    const metaFile = await metaHandle.getFile();
    const text = await metaFile.text();
    const metadata: any[] = JSON.parse(text);

    // Delete the file
    await projectDirHandle.removeEntry(fileName);

    // Update metadata
    const updatedMetadata = metadata.filter(m => m.storedFileName !== fileName);
    const metaWritable = await metaHandle.createWritable();
    await metaWritable.write(JSON.stringify(updatedMetadata, null, 2));
    await metaWritable.close();
}


/**
 * Delete the entire project directory (all files and metadata).
 */
export async function deleteProject(projectId: string) {
    if (typeof window === "undefined") {
        throw new Error("This function must be executed on the client side.");
    }

    const fsHandle = await navigator.storage.getDirectory();
    await fsHandle.removeEntry(projectId, { recursive: true });
}

/**
 * Small helper to resolve stored file names.
 */
function getStoredFileName(fileType: FileType): string {
    return fileType === FileType.Architecture_Model_PCM || fileType === FileType.Architecture_Model_UML
        ? "Architecture Model"
        : fileType;
}