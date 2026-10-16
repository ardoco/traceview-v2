'use client'

import {useFormContext} from "@/contexts/ProjectUploadContext";
import {useState} from "react";
import FileUploadStep from "@/components/multiStepForm/steps/fileUploadStep/FileUploadStep";
import ProjectDetailsStep from "@/components/multiStepForm/steps/projectDetailsStep/ProjectDetailsStep";
import SummaryStep from "@/components/multiStepForm/steps/summayStep/SummaryStep";
import {useRouter} from "next/navigation";
import FormLayout from "@/components/multiStepForm/FormLayout";
import Stepper from "@/components/multiStepForm/stepProgressBar/Stepper";
import StepContainer from "@/components/multiStepForm/steps/StepContainer";
import FormValidation from "@/components/multiStepForm/FormValidation";
import Button from "@/components/Button";
import fetchArdocoApi from "@/util/ArdocoApi";
import {storeProjectFiles, storeProjectMetadata} from "@/util/ClientFileStorage";
import ConfigurationStep from "@/components/multiStepForm/steps/configurationStep/ConfigurationStep";
import {useApiAddressContext} from "@/contexts/ApiAddressContext";
import LoadingErrorModal from "@/components/LoadingErrorModal";
import {Dialog, DialogPanel, DialogTitle} from '@headlessui/react';
import {v4 as uuidv4} from "uuid";
import {DisplayErrors} from "@/components/multiStepForm/steps/configurationStep/ErrorState";

/**
 * Value of the `inconsistencies` URL parameter of the result view:
 * "true" = the inconsistencies are part of the trace link run (SWATTR), an id = separate inconsistency run,
 * "failed" = the separate run could not be started, "false" = not requested.
 */
function inconsistenciesParam(requestId: string, inconsistencyRequestId?: string, inconsistencyError?: string): string {
    if (inconsistencyError) return "failed";
    if (!inconsistencyRequestId) return "false";
    return inconsistencyRequestId === requestId ? "true" : inconsistencyRequestId;
}

export interface Step {
    stepperLabel: string;
    title: string;
    description: string;
    validation: () => string[]
}

export default function MultiStepFormNewProject() {
    const {formData} = useFormContext();
    const {apiAddress} = useApiAddressContext();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    // furthest step the user has reached so far, used to allow jumping forward to completed steps
    const [furthestStep, setFurthestStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errorModalApiErrorOpen, setErrorModalApiErrorOpen] = useState(false);
    const [errorModalFileUpload, setErrorModalFileUpload] = useState(false);

    const steps: Step[] = [{
        stepperLabel: "Upload Files",
        title: "Upload the Project Files",
        description: "Upload the files of the project. For each file, select the corresponding file type.",
        validation: () => FormValidation.validateFiles(formData.projectName, formData.selectedTraceLinkType?.name || null, formData.files),
    }, {
        stepperLabel: "Project Details",
        title: "Project Details",
        description: "Enter the project name and select the type of trace links you want to retrieve. To additionally find inconsistencies, check the corresponding box.",
        validation: () => FormValidation.validateProjectDetails(formData.projectName, formData.selectedTraceLinkType?.name || null),
    }, {
        stepperLabel: "Configuration",
        title: "Configure ARDoCo",
        description: "If you want you can adjust the default configuration for finding trace links, else proceed with the defaults.",
        validation: () => [],
    }, {
        stepperLabel: "Summary",
        title: "Summary",
        description: "Review your provided data. If you want to change anything, return to the corresponding step before calculating the trace links.",
        validation: () => FormValidation.validateSummary(formData.projectName, formData.selectedTraceLinkType?.name || null, formData.files),
    },];

    const errors = steps[currentStep].validation();

    // A step can be selected in the stepper if it is an earlier step or if it was already reached
    // and all steps before it are valid.
    const isStepReachable = (step: number) =>
        step < currentStep || (step <= furthestStep && steps.slice(0, step).every((s) => s.validation().length === 0));

    const goToStep = (step: number) => {
        setCurrentStep(step);
        setFurthestStep((furthest) => Math.max(furthest, step));
    };

    const nextStep = async () => {
        if (errors.length > 0) {
            return;
        }
        if (currentStep === steps.length - 1) {
            const summary_validation = steps[currentStep].validation()
            if (summary_validation && summary_validation.length > 0) {
                return
            } else {
                let result = null;
                try {
                    result = await handleSubmit();
                } catch (error) {
                    console.error("Error during submission:", error);
                    setLoading(false);
                    setErrorModalApiErrorOpen(true);
                    return;
                }
                if (!result) {
                    return; // handleSubmit already shows the error
                }
                const requestId = result.jsonResult.requestId;
                const params = new URLSearchParams({
                    type: formData.selectedTraceLinkType?.name ?? "",
                    inconsistencies: inconsistenciesParam(requestId, result.inconsistencyRequestId, result.inconsistencyError),
                });
                router.push(`/view/${encodeURIComponent(requestId)}?${params.toString()}`);
            }
        } else {
            goToStep(Math.min(currentStep + 1, steps.length - 1));
        }
    };

    const prevStep = () => {
        setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));
    };

    const handleSubmit = async () => {
        let jsonResult = null
        let result = null;
        setLoading(true);
        try {
            result = await fetchArdocoApi(apiAddress!, formData.projectName, formData.selectedTraceLinkType, formData.files, formData.findInconsistencies, formData.traceLinkConfiguration);
            jsonResult = result.jsonResult
        } catch (error) {
            console.error("Error submitting data:", error);
            setLoading(false);
            setErrorModalApiErrorOpen(true);
            return
        }

        try {
            // Store project files in the client storage
            await storeProjectFiles(jsonResult.requestId, result.usedFiles);
            await storeProjectMetadata(jsonResult.requestId, formData.files, {inconsistencyRequestId: result.inconsistencyRequestId})
        } catch (error) {
            console.error("Error storing project files:", error);
            setLoading(false);
            setErrorModalFileUpload(true);
            return;
        }


        return result;
    };

    // Show only the uploaded files (no API call), e.g. after the API request failed.
    const viewFilesOnly = async () => {
        setErrorModalApiErrorOpen(false);
        const storageId = uuidv4();
        try {
            await storeProjectFiles(storageId, formData.files);
            await storeProjectMetadata(storageId, formData.files);
        } catch (error) {
            console.error("Error storing project files:", error);
            setErrorModalFileUpload(true);
            return;
        }
        router.push(`/view-provided/${encodeURIComponent(storageId)}`);
    };

    return (<FormLayout>
        <Stepper
            steps={steps.map((step) => step.stepperLabel)}
            currentStep={currentStep}
            onStepChange={goToStep}
            isStepReachable={isStepReachable}
        />

        <div className="content-center flex flex-col w-full mt-8">
            <StepContainer>
                {/* Heading */}
                <h2 className="text-3xl font-bold text-black mb-4">
                    {steps[currentStep].title}
                </h2>
                {/* Description */}
                <p className="text-base leading-relaxed text-black-700 mb-8">
                    {steps[currentStep].description}
                </p>

                {/* Step-specific components */}
                {currentStep === 0 && <FileUploadStep/>}
                {currentStep === 1 && <ProjectDetailsStep/>}
                {currentStep === 2 && <ConfigurationStep/>}
                {currentStep === 3 && <SummaryStep/>}

                {/* Error messages */}
                <DisplayErrors errors={errors}/>

            </StepContainer>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between w-full mt-8">
            {currentStep === 0 ? <span/> : <Button text="Back" onButtonClicked={prevStep}/>}
            <Button
                text={currentStep === steps.length - 1 ? "Calculate Trace Links" : "Next"}
                onButtonClicked={nextStep}
                disabled={loading || errors.length > 0}
            >

            </Button>
        </div>
        {/* Loading/Error Modal */}
        {errorModalApiErrorOpen && (<LoadingErrorModal
            isOpen={errorModalApiErrorOpen}
            message="An error occurred while processing your request. Please try again."
            onRetry={() => {
                setErrorModalApiErrorOpen(false);
            }}
            onViewFiles={viewFilesOnly}
        />)}

        {errorModalFileUpload && (<ErrorModalFileUpload
            isOpen={errorModalFileUpload}
            message="An error occurred while uploading the files. Please try again."
            onClose={() => setErrorModalFileUpload(false)}
        />)}

        {/* Loading State */}
    </FormLayout>);
}

// this differs from the loading Error modal as that there is only a single okay button.
export function ErrorModalFileUpload({isOpen, message, onClose}: {
    isOpen: boolean,
    message: string,
    onClose: () => void
}) {
    if (!isOpen) return null;

    return (<Dialog as="div" className="relative z-[100]" open={isOpen} onClose={() => { /* Do nothing on overlay click */
    }}>
        <div className="fixed inset-0 bg-black/30"/>
        <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <DialogPanel
                    className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl">
                    <DialogTitle as="h3" className="text-lg font-medium leading-6 text-red-600">
                        An Error Occurred
                    </DialogTitle>
                    <div className="mt-4">
                        <p className="text-sm text-gray-700">
                            {message}
                        </p>
                    </div>
                    <div className="mt-6 flex justify-end gap-x-3">
                        <button type="button"
                                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                                onClick={onClose}>
                            Okay
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </div>
    </Dialog>);

}
