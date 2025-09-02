'use client'

import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {convertStringToFileType, FileType} from "@/components/dataTypes/FileType";

export async function storeProjectFiles(projectId: string, uploadedFiles: UploadedFile[]) {
    if (typeof window === "undefined") {
        throw new Error("This function must be executed on the client side.");
    }
    const fsHandle = await navigator.storage.getDirectory();
    const projectDirHandle = await fsHandle.getDirectoryHandle(projectId, {create: true});

    for (const uploadedFile of uploadedFiles) {
        const fileHandle = await projectDirHandle.getFileHandle(getStoredFileName(uploadedFile.fileType), {create: true});
        const writable = await fileHandle.createWritable();
        await writable.write(uploadedFile.file);
        await writable.close();
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
    const projectDirHandle = await fsHandle.getDirectoryHandle(projectId, {create: true});

    const metadata = uploadedFiles.map(file => ({
        fileType: file.fileType,
        storedFileName: getStoredFileName(file.fileType),
        originalName: file.file.name
    }));

    await writeMetadataToFile(projectDirHandle, metadata);
}

export async function loadProjectFile(projectId: string, fallbackType: FileType): Promise<{
    content: string;
    fileType: FileType
} | null> {
    if (typeof window === "undefined") {
        throw new Error("This function must be executed on the client side.");
    }
    try {
        const fsHandle = await navigator.storage.getDirectory();
        const projectDirHandle = await fsHandle.getDirectoryHandle(projectId, {create: true});
        const fileName = getStoredFileName(fallbackType);
        let actualFileType: FileType = fallbackType;
        let actualFileName = fileName;

        // Load metadata to get the actual file type and stored name
        try {
            const metadata = await readMetadataFromFile(projectDirHandle);
            const fileMeta = metadata.find(m => m.storedFileName === fileName);
            if (fileMeta) {
                actualFileType = convertStringToFileType(fileMeta.fileType);
                actualFileName = getStoredFileName(actualFileType); // Use actualFileType for the file name if found in metadata
            }
        } catch (e) {
            console.warn("Metadata not found or unreadable for file:", fileName, e);
        }

        const fileHandle = await projectDirHandle.getFileHandle(actualFileName);
        const file = await fileHandle.getFile();
        const content = await file.text();

        const result = {content: content, fileType: actualFileType};
        console.log(`[ClientFileStorage] Loaded file ${actualFileName} of type ${actualFileType} for project ${projectId}.`);
        return result;

    } catch (error: any) {
        if (error.name === "NotFoundError") {
            console.error("File not found: ", error);
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

    const metadata = await readMetadataFromFile(projectDirHandle);
    return metadata.map(m => convertStringToFileType(m.fileType));
}

export async function deleteProjectDirectory(projectId: string) {
    if (typeof window === "undefined") {
        console.warn("Cannot delete project directory on the server.");
        return;
    }
    try {
        const fsHandle = await navigator.storage.getDirectory();
        await fsHandle.removeEntry(projectId, {recursive: true});
        console.log(`[ClientFileStorage] Project directory ${projectId} and all its contents removed.`);
    } catch (error: any) {
        console.error(`[ClientFileStorage] Failed to remove project directory ${projectId}:`, error);
    }
}

/**
 * Small helper to resolve stored file names.
 */
function getStoredFileName(fileType: FileType): string {
    return fileType === FileType.architectureModelPCM || fileType === FileType.architectureModelUML
        ? "Architecture Model"
        : fileType;
}

/**
 * Reads metadata from the project's meta.json file.
 */
async function readMetadataFromFile(projectDirHandle: FileSystemDirectoryHandle): Promise<any[]> {
    const metaHandle = await projectDirHandle.getFileHandle(`project.meta.json`);
    const metaFile = await metaHandle.getFile();
    const text = await metaFile.text();
    return JSON.parse(text);
}

/**
 * Writes metadata to the project's meta.json file.
 */
async function writeMetadataToFile(projectDirHandle: FileSystemDirectoryHandle, metadata: any[]) {
    const metaHandle = await projectDirHandle.getFileHandle(`project.meta.json`, {create: true});
    const metaWritable = await metaHandle.createWritable();
    await metaWritable.write(JSON.stringify(metadata, null, 2));
    await metaWritable.close();
}
