'use client'

import {useFormContext} from "@/contexts/ProjectFormContext";
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

    const steps: Step[] = [
        {
            stepperLabel: "Upload Files",
            title: "Upload the Project Files",
            description:
                "Upload the project files for the project. For each file, select the corresponding file type.",
            validation: () => FormValidation.validateFiles(formData.projectName, formData.selectedTraceLinkType?.name || null, formData.files),
        },
        {
            stepperLabel: "Project Details",
            title: "Project Details",
            description:
                "Enter the project name (this is used for finding the traceLinks) and select the type of traceLinks you want to retrieve.",
            validation: () => FormValidation.validateProjectDetails(formData.projectName, formData.selectedTraceLinkType?.name || null, formData.files),
        },
        {
            stepperLabel: "Configuration",
            title: "Configure ArDoCo",
            description:
                "Review and adjust the default configuration for finding traceLinks if desired, else proceed with defaults.",
            validation: () => [], // For now, no specific validation for this step.
                                  // You might add validation here if specific configuration values are required.
        },
        {
            stepperLabel: "Summary",
            title: "Summary",
            description:
                "Review the data you provided. If changes are required, return to the corresponding step and modify before calculating the traceLinks.",
            validation: () => FormValidation.validateSummary(formData.projectName, formData.selectedTraceLinkType?.name || null, formData.files),
        },
    ];

    let errors = steps[currentStep].validation();

    const nextStep = async () => {
        if (currentStep === steps.length - 1) {
            let summary_validation = steps[currentStep].validation()
            if (summary_validation && summary_validation.length > 0) {
                return
            } else {
                let result = await handleSubmit();
                console.log(result);
                const encodedId = encodeURIComponent(result.requestId);
                redirect(`/view/${encodedId}?type=${formData.selectedTraceLinkType?.name}`);
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
        if (!apiAddress) {
            console.error("API address is not set.");
            return null;
        }
        let jsonResult = null
        setLoading(true);
        try {
            let result = await fetchArDoCoAPI(apiAddress, formData.projectName, formData.selectedTraceLinkType, formData.files, formData.traceLinkConfiguration);
            console.log("Data submitted successfully:", formData);
            jsonResult = result.jsonResult

            // Store project files in the client storage
            if (jsonResult?.requestId) {
                await storeProjectFiles(jsonResult.requestId, result.usedFiles);
                await storeProjectMetadata(jsonResult.requestId, formData.files)
                console.log(`Project files for request ID ${jsonResult.requestId} stored successfully.`);
            }
        } catch (error) {
            console.error("Error submitting data:", error);
            setLoading(false);
        }
        return jsonResult;
    };


    return (
        <FormLayout>
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
                    {errors.length > 0 && (
                        <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-sm">
                            {errors.map((error, index) => (
                                <p key={index} className="text-sm">
                                    {error}
                                </p>
                            ))}
                        </div>
                    )}
                </StepContainer>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between w-full mt-8">
                <Button text={currentStep === 0 ? "Exit" : "Back"} onButtonClicked={prevStep}/>
                <Button
                    text={currentStep === steps.length - 1
                        ? "Calculate TraceLinks"
                        : "Next"}
                    onButtonClicked={nextStep}
                    disabled={loading || currentStep == steps.length - 1 && errors.length > 0}
                >

                </Button>
            </div>
        </FormLayout>
    );
}

export default MultiStepForm;
