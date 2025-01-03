import { useFormContext } from "@/components/multi-step-form-wizard/ProjectFormContext";
import { useState } from "react";
import UploadFileView from "@/components/multi-step-form-wizard/Views/UploadFileView";
import ProjectInfoView from "@/components/multi-step-form-wizard/Views/ProjectInfoView";
import SummaryView from "@/components/multi-step-form-wizard/Views/SummaryView";
import { redirect } from "next/navigation";
import PipelineLayout from "@/components/multi-step-form-wizard/PipelineLayout";
import PipelineStepper from "@/components/multi-step-form-wizard/PipelineStepper";
import Step from "../inputPipeline/Steps";

interface Step {
    stepperLabel: string;
    title: string;
    description: string;
}

function MultiStepForm() {
    const { formData, updateFormData } = useFormContext();
    const [currentStep, setCurrentStep] = useState(0);

    const steps: Step[] = [
        {
            stepperLabel: 'Upload Files',
            title: 'Upload the Project Files',
            description: 'Upload the project files for the project. For each file select the corresponding file type.',
        },
        {
            stepperLabel: 'Project Details',
            title: 'Project Details',
            description: 'Enter the project name (this is used for finding the traceLinks) and select the type of traceLinks you want to retrieve.',
        },
        {
            stepperLabel: 'Summary',
            title: 'Summary',
            description: 'In case you want to change any of the data you provided, go back to the corresponding step and modify the data there, before calculating the traceLinks.',
        },
    ];

    const nextStep = () => {
        if (currentStep === steps.length - 1) {
            handleSubmit();
            redirect('/view');
        } else {
            setCurrentStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
        }
    };

    const prevStep = () => {
        if (currentStep === 0) {
            redirect('/');
        } else {
            setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));
        }
    };

    const handleSubmit = async () => {
        try {
            console.log('Data submitted successfully:', formData);
        } catch (error) {
            console.error('Error submitting data:', error);
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
                    <h2 className="text-3xl bg-clip-text text-transparent text-blue-600 mb-4">
                        {steps[currentStep].title}
                    </h2>
                    <p className="text-base leading-relaxed text-gray-700 mb-8">
                        {steps[currentStep].description}
                    </p>

                    {currentStep === 0 && <UploadFileView />}
                    {currentStep === 1 && <ProjectInfoView />}
                    {currentStep === 2 && <SummaryView />}
                </Step>
            </div>

            <div className="flex justify-between w-full mt-8">
                <button
                    onClick={prevStep}
                    className="px-6 py-3 border-2 border-blue-400 rounded-lg text-lg font-medium text-blue-600 hover:bg-blue-100 transition duration-300"
                >
                    {currentStep === 0 ? "Exit" : "Back"}
                </button>
                <button
                    onClick={nextStep}
                    className="px-6 py-3 bg-blue-600 rounded-lg text-lg font-medium text-white hover:bg-blue-500 transition duration-300"
                >
                    {currentStep === steps.length - 1 ? "Calculate TraceLinks" : "Next"}
                </button>
            </div>
        </PipelineLayout>
    );
}

export default MultiStepForm;
