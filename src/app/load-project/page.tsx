'use client';

import {FormProvider} from "@/contexts/ProjectUploadContext";
import {FileType} from "@/components/dataTypes/FileType";
import MultiStepFormLoadProject from "@/components/loadExistingProject/MultiStepFormLoadProject";

export default function Page() {

    return (
        <div className="bg-white h-full z-1 relative">
            <FormProvider allowedFileTypes={Object.values(FileType)}>
                <MultiStepFormLoadProject/>
            </FormProvider>
        </div>
    )
}