'use client'

import {FormProvider, useFormContext} from "@/components/multi-step-form-wizard/ProjectFormContext";
import MultiStepForm from "@/components/multi-step-form-wizard/MultiStepForm";

export default function startNewProject() {
    return(
        <div>
            <FormProvider>
                <MultiStepForm/>
            </FormProvider>
        </div>

    )
}


