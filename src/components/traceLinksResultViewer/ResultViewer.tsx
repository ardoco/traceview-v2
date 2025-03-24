
import {Panel} from "react-resizable-panels";
import Dropdown from "@/components/inputComponents/Dropdown";
import React, {Suspense, useState} from "react";
import DisplayDocumentation from "@/components/traceLinksResultViewer/views/Documentation";
import DisplayCodeModel from "@/components/traceLinksResultViewer/views/CodeModel";
import DisplayArchitectureModel from "@/components/traceLinksResultViewer/views/ArchitectureModel";
import DisplayRawJsonTracelinks from "@/components/traceLinksResultViewer/views/RawJsonTracelinks";
import {ResultViewOptions} from "@/components/dataTypes/ResultViewOptions";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {FileType} from "@/components/dataTypes/FileType";
import {Dialog, Select, Button} from "@headlessui/react";
import {ArrowsPointingOutIcon} from "@heroicons/react/24/solid";

interface ResultViewProps {
    id: string;
    collapsible: boolean;
    JSONResult: any;
    displayOptions: ResultViewOptions[];
    defaultView: ResultViewOptions;
    setSelectedDialogView: (value: ResultViewOptions | null) => void;
}

export default function ResultView({ id, collapsible, JSONResult, displayOptions, defaultView, setSelectedDialogView }: ResultViewProps) {
    const [selectedView, setSelectedView] = useState(defaultView);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const handleOptionChange = (value: ResultViewOptions) => {
        setSelectedView(value);
    };

    return (
        <Panel
            minSize={10}
            className="h-full overflow-y-auto"
            style={{ overflowY: "auto", overflowX: "auto" }}
            collapsible={collapsible} // Use the input prop here
            collapsedSize={0}
        >
            <div className="sticky top-0 flex bg-white">
                <Select value={selectedView} onChange={(e) => handleOptionChange(e.target.value as ResultViewOptions)}
                        className="border-none flex-grow focus:ring-2 focus:ring-gruen focus:border-gruen ">
                    {displayOptions.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </Select>
                {/*<Dropdown options={displayOptions} selectedValue={selectedView} onChange={handleOptionChange} />*/}
                <Button onClick={() => setSelectedDialogView(selectedView)} className="p-3">
                    <ArrowsPointingOutIcon className="w-4 h-4"/>
                </Button>
            </div>

            {selectedView === ResultViewOptions.Documentation &&
                <Suspense fallback={<h1>Loading</h1>}><DisplayDocumentation JSONResult={JSONResult} id={id}/></Suspense>}
            {selectedView === ResultViewOptions.Code_Model && <DisplayCodeModel JSONResult={JSONResult} id={id}/>}
            {selectedView === ResultViewOptions.Architecture_Model && <DisplayArchitectureModel JSONResult={JSONResult} id={id}/>}
        {selectedView === ResultViewOptions.Raw_JSON && <DisplayRawJsonTracelinks JSONResult={JSONResult}/>}

            <Dialog onClose={() => setIsOpen(false)} open={isOpen} className="bg-white fixed top-0 left-0 w-full h-full overflow-y-auto z-1000">
                {selectedView === ResultViewOptions.Documentation && <Suspense fallback={<h1>Loading</h1>}><DisplayDocumentation JSONResult={JSONResult} id={id}/></Suspense>}
                {selectedView === ResultViewOptions.Code_Model && <DisplayCodeModel JSONResult={JSONResult} id={id}/>}
                {selectedView === ResultViewOptions.Architecture_Model && <DisplayArchitectureModel JSONResult={JSONResult} id={id}/>}
                {selectedView === ResultViewOptions.Raw_JSON && <DisplayRawJsonTracelinks JSONResult={JSONResult}/>}
            </Dialog>
        </Panel>
    );
}

async function loadProjectFile(projectId: string, fileType: FileType): Promise<UploadedFile> {
    const fsHandle = await navigator.storage.getDirectory();

    const projectDirHandle = await fsHandle.getDirectoryHandle(projectId, { create: true });

    const fileHandle = await projectDirHandle.getFileHandle(fileType);

    return {
        fileType: fileType,
        file: await fileHandle.getFile()
    }
}