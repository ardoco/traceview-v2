'use client'

import {useFormContext} from "@/components/multi-step-form-wizard/ProjectFormContext";
import {useState} from "react";
import UploadFileView from "@/components/multi-step-form-wizard/Views/UploadFileView";
import ProjectInfoView from "@/components/multi-step-form-wizard/Views/ProjectInfoView";
import SummaryView from "@/components/multi-step-form-wizard/Views/SummaryView";
import {redirect} from "next/navigation";
import PipelineLayout from "@/components/multi-step-form-wizard/PipelineLayout";
import PipelineStepper from "@/components/multi-step-form-wizard/PipelineStepper";
import Step from "../inputPipeline/Steps";
import Validation from "@/components/multi-step-form-wizard/Validation";
import Button from "@/components/Button";
import fetchArDoCoAPI from "@/components/callArDoCoAPI";

interface Step {
    stepperLabel: string;
    title: string;
    description: string;
    validation: () => string[]
}

function MultiStepForm() {
    const {formData} = useFormContext();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const steps: Step[] = [
        {
            stepperLabel: "Upload Files",
            title: "Upload the Project Files",
            description:
                "Upload the project files for the project. For each file, select the corresponding file type.",
            validation: () => Validation.validateFiles(formData.projectName, formData.selectedTraceLinkType?.name || null, formData.files),
        },
        {
            stepperLabel: "Project Details",
            title: "Project Details",
            description:
                "Enter the project name (this is used for finding the traceLinks) and select the type of traceLinks you want to retrieve.",
            validation: () => Validation.validateProjectDetails(formData.projectName, formData.selectedTraceLinkType?.name || null, formData.files),
        },
        {
            stepperLabel: "Summary",
            title: "Summary",
            description:
                "Review the data you provided. If changes are required, return to the corresponding step and modify before calculating the traceLinks.",
            validation: () => Validation.validateSummary(formData.projectName, formData.selectedTraceLinkType?.name || null, formData.files),
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
        let jsonResult = null
        setLoading(true);
        try {
            jsonResult = await fetchArDoCoAPI(formData.projectName, formData.selectedTraceLinkType, formData.files)
            console.log("Data submitted successfully:", formData);
        } catch (error) {
            console.error("Error submitting data:", error);
            setLoading(false);
        }
        return jsonResult;
    };


    return (
        <PipelineLayout>
            <PipelineStepper
                steps={steps.map((step) => step.stepperLabel)}
                currentStep={currentStep}
                onStepChange={(step: number) => setCurrentStep(step)}
            />

            <div className="content-center flex flex-col w-full mt-8">
                <Step>
                    {/* Heading */}
                    <h2 className="text-3xl font-bold text-black mb-4">
                        {steps[currentStep].title}
                    </h2>
                    {/* Description */}
                    <p className="text-base leading-relaxed text-black-700 mb-8">
                        {steps[currentStep].description}
                    </p>

                    {/* Step-specific components */}
                    {currentStep === 0 && <UploadFileView/>}
                    {currentStep === 1 && <ProjectInfoView/>}
                    {currentStep === 2 && <SummaryView/>}

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
                </Step>
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
        </PipelineLayout>
    );
}

export default MultiStepForm;
