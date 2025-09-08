'use client'

import {FormProvider} from "@/contexts/ProjectUploadContext";
import MultiStepFormNewProject from "@/components/multiStepForm/MultiStepFormNewProject";
import {FileType} from "@/components/dataTypes/FileType";

export default function startNewProject() {
    return (
        <div className="bg-white h-full z-1 relative">
            <FormProvider allowedFileTypes={
                Object.values(FileType)
                    .filter(type => type !== FileType.TRACELINKS && type !== FileType.INCONSISTENCIES)}>
                <MultiStepFormNewProject/>
            </FormProvider>
        </div>
    )
}


