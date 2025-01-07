import { useFormContext } from "@/components/multi-step-form-wizard/ProjectFormContext";
import { useState } from "react";
import UploadFileView from "@/components/multi-step-form-wizard/Views/UploadFileView";
import ProjectInfoView from "@/components/multi-step-form-wizard/Views/ProjectInfoView";
import SummaryView from "@/components/multi-step-form-wizard/Views/SummaryView";
import { redirect } from "next/navigation";
import PipelineLayout from "@/components/multi-step-form-wizard/PipelineLayout";
import PipelineStepper from "@/components/multi-step-form-wizard/PipelineStepper";
import Step from "../inputPipeline/Steps";
import Validation from "@/components/multi-step-form-wizard/Validation";
import {UploadedFile} from "@/components/drag-and-drop/FileListItem";

interface Step {
    stepperLabel: string;
    title: string;
    description: string;
    validation: () => string[]
}

function MultiStepForm() {
    const { formData } = useFormContext();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState<boolean>(false);

    const steps: Step[] = [
        {
            stepperLabel: "Upload Files",
            title: "Upload the Project Files",
            description:
                "Upload the project files for the project. For each file, select the corresponding file type.",
            validation: () => Validation.validateFiles(formData.projectName, formData.selectedTraceLinkType, formData.files),
        },
        {
            stepperLabel: "Project Details",
            title: "Project Details",
            description:
                "Enter the project name (this is used for finding the traceLinks) and select the type of traceLinks you want to retrieve.",
            validation: () => Validation.validateProjectDetails(formData.projectName, formData.selectedTraceLinkType, formData.files),
        },
        {
            stepperLabel: "Summary",
            title: "Summary",
            description:
                "Review the data you provided. If changes are required, return to the corresponding step and modify before calculating the traceLinks.",
            validation: () => Validation.validateSummary(formData.projectName, formData.selectedTraceLinkType, formData.files),
        },
    ];

    let errors = steps[currentStep].validation();

    const nextStep = async () => {
        if (currentStep === steps.length - 1) {
            let summary_validation = steps[currentStep].validation()
            if (summary_validation && summary_validation.length > 0) {
                return
            } else {
                setLoading(true);
                await handleSubmit();
                setLoading(false);
                redirect("/view");
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
        try {
            console.log("Data submitted successfully:", formData);
        } catch (error) {
            console.error("Error submitting data:", error);
        }
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
                    {currentStep === 1 && <ProjectInfoView />}
                    {currentStep === 2 && <SummaryView />}

                    {/* Error messages */}
                    {errors.length > 0 && (
                        <div className="mt-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
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
                <button
                    onClick={prevStep}
                    className="px-6 py-3 border-2 border-blue-400 rounded-lg text-lg font-medium text-blue-600 hover:bg-blue-100 transition duration-300"
                >
                    {currentStep === 0 ? "Exit" : "Back"}
                </button>
                <button
                    onClick={nextStep}
                    disabled={loading}
                    className={`px-6 py-3 rounded-lg text-lg font-medium text-white transition duration-300 ${
                        loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-500"
                    }`}
                >
                    {currentStep === steps.length - 1
                        ? "Calculate TraceLinks"
                        : "Next"}
                </button>
            </div>
        </PipelineLayout>
    );
}

export default MultiStepForm;
