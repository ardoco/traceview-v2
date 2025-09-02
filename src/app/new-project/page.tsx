'use client'

import {FormProvider} from "@/contexts/ProjectUploadContext";
import MultiStepForm from "@/components/multiStepForm/MultiStepForm";
import {FileType} from "@/components/dataTypes/FileType";

export default function startNewProject() {
    return (
        <div className="bg-white h-full z-1 relative">
            <FormProvider allowedFileTypes={
                Object.values(FileType)
                    .filter(type => type !== FileType.TRACELINKS && type !== FileType.INCONSISTENCIES)}>
                <MultiStepForm/>
            </FormProvider>
        </div>
    )
}


