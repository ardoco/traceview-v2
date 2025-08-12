'use client'

import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {convertStringToFileType, FileType} from "@/components/dataTypes/FileType";

// lock for metadata operations
const metadataLocks: { [projectId: string]: Promise<(() => void) | undefined> } = {};

/**
 * Acquires a lock for a given project's metadata.
 * Operations that modify metadata should await this lock.
 * Returns a function to release the lock.
 */
async function acquireMetadataLock(projectId: string): Promise<() => void> {
    while (metadataLocks[projectId]) {
        await metadataLocks[projectId];
    }
    let releaseLock!: () => void; // Declare with definite assignment assertion
    metadataLocks[projectId] = new Promise<(() => void) | undefined>(resolve => {
        releaseLock = () => {
            delete metadataLocks[projectId];
            resolve(undefined); // Resolve with undefined when released
        };
        // Resolve the promise for the current lock holder with the release function
        // This makes sure the promise in metadataLocks[projectId] holds the release function
        // but it's not directly returned by acquireMetadataLock.
        // The actual release function is returned by the outer Promise.
    });
    return releaseLock;
}

/**
 * Releases a lock for a given project's metadata.
 */
function releaseMetadataLock(projectId: string, release: () => void) {
    release();
}

export async function storeProjectFiles(projectId: string, uploadedFiles: UploadedFile[]) {
    if (typeof window === "undefined") {
        throw new Error("This function must be executed on the client side.");
    }
    const fsHandle = await navigator.storage.getDirectory();
    const projectDirHandle = await fsHandle.getDirectoryHandle(projectId, {create: true});

    console.log(`[ClientFileStorage] projectDirHandle:`, projectDirHandle);

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

    const release = await acquireMetadataLock(projectId);
    try {
        const fsHandle = await navigator.storage.getDirectory();
        const projectDirHandle = await fsHandle.getDirectoryHandle(projectId, { create: true });

        const metadata = uploadedFiles.map(file => ({
            fileType: file.fileType,
            storedFileName: getStoredFileName(file.fileType),
            originalName: file.file.name
        }));

        await writeMetadataToFile(projectDirHandle, metadata);
    } finally {
        releaseMetadataLock(projectId, release);
    }
}


async function storeProjectFile(projectDirHandle: FileSystemDirectoryHandle, file: UploadedFile) {
    const fileName = getStoredFileName(file.fileType);

    // Store the actual file
    const fileHandle = await projectDirHandle.getFileHandle(fileName, {create: true});
    const writable = await fileHandle.createWritable();
    await writable.write(file.file);
    await writable.close();
}

export async function loadProjectFile(projectId: string, fallbackType: FileType, deleteFileAfterLoad = false): Promise<{content: string, fileType: FileType} | null> {
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

        const result = { content: content, fileType: actualFileType };
        console.log(`[ClientFileStorage] Loaded file ${actualFileName} of type ${actualFileType} for project ${projectId}.`);

        if (deleteFileAfterLoad) {
            try {
                // Pass projectDirHandle and fsHandle to avoid re-fetching them inside deleteProjectFile
                await deleteProjectFile(projectId, actualFileName, projectDirHandle, fsHandle);
                console.log(`[ClientFileStorage] File ${actualFileName} deleted after successful load.`);
            } catch (deleteError) {
                console.error(`[ClientFileStorage] Failed to delete file ${actualFileName} after loading:`, deleteError);
            }
        }

        return result;

    } catch (error: any) {
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

    const metadata = await readMetadataFromFile(projectDirHandle);
    return metadata.map(m => convertStringToFileType(m.fileType));
}

export async function deleteProjectFile(projectId: string, fileName: string, projectDirHandle?: FileSystemDirectoryHandle, fsHandle?: FileSystemDirectoryHandle) {
    if (typeof window === "undefined") {
        throw new Error("This function must be executed on the client side.");
    }

    const release = await acquireMetadataLock(projectId);
    try {
        const currentFsHandle = fsHandle || await navigator.storage.getDirectory();
        const currentProjectDirHandle = projectDirHandle || await currentFsHandle.getDirectoryHandle(projectId);

        // Load metadata
        let metadata: any[] = [];
        try {
            metadata = await readMetadataFromFile(currentProjectDirHandle);
            console.log(`[ClientFileStorage] Metadata loaded for project ${projectId} before deletion:`, metadata);
        } catch (e) {
            console.warn(`[ClientFileStorage] No metadata found for project ${projectId}. Proceeding with file deletion only.`, e);
        }

        // Delete the file
        await currentProjectDirHandle.removeEntry(fileName);

        // Update metadata
        const updatedMetadata = metadata.filter(m => m.storedFileName !== fileName);
        await writeMetadataToFile(currentProjectDirHandle, updatedMetadata);
        console.log(`[ClientFileStorage] Metadata updated: `, updatedMetadata);

        // if the metadata is empty, delete the metadata file and directory
        if (updatedMetadata.length === 0) {
            await currentProjectDirHandle.removeEntry(`project.meta.json`);
            try {
                await currentFsHandle.removeEntry(projectId, { recursive: true });
                console.log(`[ClientFileStorage] Project directory ${projectId} removed as no files remain.`);
            } catch (error) {
                console.warn(`[ClientFileStorage] Failed to remove project directory ${projectId}:`, error);
            }
        }
    } finally {
        releaseMetadataLock(projectId, release);
    }
}

/**
 * Small helper to resolve stored file names.
 */
function getStoredFileName(fileType: FileType): string {
    return fileType === FileType.Architecture_Model_PCM || fileType === FileType.Architecture_Model_UML
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
    const metaHandle = await projectDirHandle.getFileHandle(`project.meta.json`, { create: true });
    const metaWritable = await metaHandle.createWritable();
    await metaWritable.write(JSON.stringify(metadata, null, 2));
    await metaWritable.close();
}

export async function deleteProjectDirectory(projectId: string) {
    if (typeof window === "undefined") {
        console.warn("Cannot delete project directory on the server.");
        return;
    }
    try {
        const fsHandle = await navigator.storage.getDirectory();
        await fsHandle.removeEntry(projectId, { recursive: true });
        console.log(`[ClientFileStorage] Project directory ${projectId} and all its contents removed.`);
    } catch (error: any) {
        console.error(`[ClientFileStorage] Failed to remove project directory ${projectId}:`, error);
    }
}