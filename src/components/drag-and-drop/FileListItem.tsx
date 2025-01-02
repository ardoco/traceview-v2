import {useState} from "react";
import {FileType} from "next/dist/lib/file-exists";
import {Button} from "@headlessui/react";

interface FileListItemProps {
    file: File;
    onDelete: (file:File) => void;
}

export default function FileListItem({file, onDelete}: FileListItemProps) {

    const [fileType, setFileType] = useState<FileType>()



    return (
        <div className={"flex flex-row w-full border rounded justify-between my-1 py-1"}>
            <div className={"w-1/3 overflow-hidden "} title={file.name}>
                {file.name}
            </div>
            <div className={"w-1/3 overflow-hidden text-ellipsis "} title={file.type}>
                {file.type}
            </div>

            <Button
                onClick={() => { onDelete(file); }}
                className={"hover:text-red-500 m-1"}
            >
                X
            </Button>
        </div>
    );
}