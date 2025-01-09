'use client'

import {FormProvider, useFormContext} from "@/components/multi-step-form-wizard/ProjectFormContext";
import MultiStepForm from "@/components/multi-step-form-wizard/MultiStepForm";

export default function startNewProject() {
    return(
        <div className="bg-white z-1 relative">
            <FormProvider>
                <MultiStepForm/>
            </FormProvider>
        </div>

    )
}


