import {FileType} from "@/components/dataTypes/FileType";

export interface UploadedFile {
    file: File;
    fileType: FileType;
}