import {ArrowDownTrayIcon} from "@heroicons/react/24/outline";
import {Button} from "@headlessui/react";
import React from "react";

interface DownLoadFileComponentProps {
    fileName: string;
    prepareDataToExport: () => string | Blob;
    title: string;
}

export default function DownloadFileComponent({fileName, prepareDataToExport, title}: DownLoadFileComponentProps) {
    const handleDownloadClick = () => {
        const dataToExport = prepareDataToExport();
        const blob = typeof dataToExport === 'string' ? new Blob([dataToExport], {type: 'application/json'}) : dataToExport;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <Button onClick={handleDownloadClick}
                className="text-gray-700 hover:text-gray-500 p-1.5 -mr-2"
                title={title}>
            <ArrowDownTrayIcon className="h-4"/>
        </Button>
    );
}
