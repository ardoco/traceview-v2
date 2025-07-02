'use client'

import {FormProvider, useFormContext} from "@/components/multiStepForm/ProjectFormContext";
import MultiStepForm from "@/components/multiStepForm/MultiStepForm";
import {FileType} from "@/components/dataTypes/FileType";

export default function startNewProject() {
    return(
        <div className="bg-white z-1 relative">
            <FormProvider allowedFileTypes={Object.values(FileType).filter(type => type !== FileType.Trace_Link_JSON)}>
                <MultiStepForm/>
            </FormProvider>
        </div>
    )
}


