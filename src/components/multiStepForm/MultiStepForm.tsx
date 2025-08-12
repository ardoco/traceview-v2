'use client'

import {useFormContext} from "@/contexts/ProjectUploadContext";
import {useState} from "react";
import FileUploadStep from "@/components/multiStepForm/steps/fileUploadStep/FileUploadStep";
import ProjectDetailsStep from "@/components/multiStepForm/steps/projectDetailsStep/ProjectDetailsStep";
import SummaryStep from "@/components/multiStepForm/steps/summayStep/SummaryStep";
import {redirect} from "next/navigation";
import FormLayout from "@/components/multiStepForm/FormLayout";
import Stepper from "@/components/multiStepForm/stepProgressBar/Stepper";
import StepContainer from "@/components/multiStepForm/steps/StepContainer";
import FormValidation from "@/components/multiStepForm/FormValidation";
import Button from "@/components/Button";
import fetchArDoCoAPI from "@/util/ArdocoApi";
import {storeProjectFiles, storeProjectMetadata} from "@/util/ClientFileStorage";
import ConfigurationStep from "@/components/multiStepForm/steps/configurationStep/ConfigurationStep";
import {useApiAddressContext} from "@/contexts/ApiAddressContext";
import {v4 as uuidv4} from "uuid";
import LoadingErrorModal from "@/components/LoadingErrorModal";
import {Dialog, DialogPanel, DialogTitle} from '@headlessui/react';
import {DisplayErrors} from "@/components/multiStepForm/steps/configurationStep/ErrorState";

export interface Step {
    stepperLabel: string;
    title: string;
    description: string;
    validation: () => string[]
}

function MultiStepForm() {
    const {formData} = useFormContext();
    const {apiAddress} = useApiAddressContext();
    const [currentStep, setCurrentStep] = useState(0);
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
        description: "Enter the project name (this is used for finding the traceLinks) and select the type of traceLinks you want to retrieve. If you additionally want to find inconsistencies, check the corresponding box.",
        validation: () => FormValidation.validateProjectDetails(formData.projectName, formData.selectedTraceLinkType?.name || null, formData.files),
    }, {
        stepperLabel: "Configuration",
        title: "Configure ArDoCo",
        description: "Adjust the default configuration for finding traceLinks if desired, else proceed with defaults.",
        validation: () => [],
    }, {
        stepperLabel: "Summary",
        title: "Summary",
        description: "Review your provided data. If changes are required, return to the corresponding step and modify before calculating the traceLinks.",
        validation: () => FormValidation.validateSummary(formData.projectName, formData.selectedTraceLinkType?.name || null, formData.files),
    },];

    let errors = steps[currentStep].validation();

    const nextStep = async () => {
        if (currentStep === steps.length - 1) {
            let summary_validation = steps[currentStep].validation()
            if (summary_validation && summary_validation.length > 0) {
                return
            } else {
                let result = null;
                try {
                    result = await handleSubmit();
                } catch (error) {
                    console.error("Error during submission:", error);
                    errors.push("An error occurred while submitting the data. Please try again.");
                    setLoading(false);
                    return;
                }

                console.log(result);
                const encodedId = encodeURIComponent(result.requestId);
                const inconsistenciesParam = `&inconsistencies=${formData.findInconsistencies}`;
                redirect(`/view/${encodedId}?type=${formData.selectedTraceLinkType?.name}${inconsistenciesParam}`);
            }
        } else {
            setCurrentStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
        }
    };

    const prevStep = () => {
        if (currentStep === 0) {
            redirect("/");
        } else {
            setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));
        }
    };

    const handleSubmit = async () => {
        let jsonResult = null
        let result = null;
        setLoading(true);
        try {
            result = await fetchArDoCoAPI(apiAddress!, formData.projectName, formData.selectedTraceLinkType, formData.files, formData.findInconsistencies, formData.traceLinkConfiguration);
            jsonResult = result.jsonResult
        } catch (error) {
            console.log("Error submitting data:", error);
            setLoading(false);
            setErrorModalApiErrorOpen(true);
            return
        }

        try {
            // Store project files in the client storage
            await storeProjectFiles(jsonResult.requestId, result.usedFiles);
            await storeProjectMetadata(jsonResult.requestId, formData.files)
            console.log(`Project files for request ID ${jsonResult.requestId} stored successfully.`);
        } catch (error) {
            console.log("Error storing project files:", error);
            setLoading(false);
            setErrorModalFileUpload(true);
            return;
        }


        return jsonResult;
    };

    const handleSubmitError = async () => {
        let storageId = uuidv4(); // Generate a unique request ID
        setLoading(true);
        try {
            await storeProjectFiles(storageId, formData.files);
            await storeProjectMetadata(storageId, formData.files)
            console.log(`Project files for ID ${storageId} stored successfully.`);

        } catch (error) {
            console.error("Error submitting data:", error);
            setLoading(false);
        }
        return storageId;
    };


    return (<FormLayout>
            <Stepper
                steps={steps.map((step) => step.stepperLabel)}
                currentStep={currentStep}
                onStepChange={(step: number) => setCurrentStep(step)}
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
                <Button text={currentStep === 0 ? "Exit" : "Back"} onButtonClicked={prevStep}/>
                <Button
                    text={currentStep === steps.length - 1 ? "Calculate TraceLinks" : "Next"}
                    onButtonClicked={nextStep}
                    disabled={loading || currentStep == steps.length - 1 && errors.length > 0}
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
                    onViewFiles={async () => {
                        setErrorModalApiErrorOpen(false);
                        let storageId = await handleSubmit();
                        const encodedId = encodeURIComponent(storageId);
                        redirect(`/view-provided/${encodedId}`);
                    }}
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

export default MultiStepForm;