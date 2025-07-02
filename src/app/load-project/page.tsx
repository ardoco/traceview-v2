'use client';

import MultiStepForm from "@/components/multiStepForm/MultiStepForm";
import {FormProvider} from "@/components/multiStepForm/ProjectFormContext";
import {FileType} from "@/components/dataTypes/FileType";
import MultiStepFormLoadProject from "@/components/loadExistingProject/MultiStepFormLoadProject";

export default function () {

    return(
        <div className="bg-white z-1 relative">
            <FormProvider allowedFileTypes={Object.values(FileType)}>
                <MultiStepFormLoadProject/>
            </FormProvider>
        </div>
    )
}