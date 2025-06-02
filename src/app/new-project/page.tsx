'use client'

import {FormProvider, useFormContext} from "@/components/multiStepForm/ProjectFormContext";
import MultiStepForm from "@/components/multiStepForm/MultiStepForm";

export default function startNewProject() {
    return(
        <div className="bg-white z-1 relative">
            <FormProvider>
                <MultiStepForm/>
            </FormProvider>
        </div>

    )
}


