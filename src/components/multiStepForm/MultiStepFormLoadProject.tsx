import {useFormContext} from "@/contexts/ProjectUploadContext";
import {useState} from "react";
import FormValidation from "@/components/multiStepForm/FormValidation";
import {redirect} from "next/navigation";
import {storeProjectFiles, storeProjectMetadata} from "@/util/ClientFileStorage";
import FormLayout from "@/components/multiStepForm/FormLayout";
import Stepper from "@/components/multiStepForm/stepProgressBar/Stepper";
import StepContainer from "@/components/multiStepForm/steps/StepContainer";
import FileUploadStep from "@/components/multiStepForm/steps/fileUploadStep/FileUploadStep";
import Button from "@/components/Button";
import {Step} from "@/components/multiStepForm/MultiStepFormNewProject";
import {v4 as uuidv4} from 'uuid';
import {DisplayErrors} from "@/components/multiStepForm/steps/configurationStep/ErrorState";

function MultiStepFormLoadProject() {
    const {formData} = useFormContext();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const steps: Step[] = [{
        stepperLabel: "Upload Files",
        title: "Upload the Project Files and TraceLinks",
        description: "Upload your existing project files and the JSON file containing the traceLinks.",
        validation: () => FormValidation.validateExistingProject(formData.projectName, formData.selectedTraceLinkType?.name || null, formData.files),
    },];

    const errors = steps[currentStep].validation();

    const nextStep = async () => {
        if (currentStep === steps.length - 1) {
            const summary_validation = steps[currentStep].validation()
            if (summary_validation && summary_validation.length > 0) {
                return
            } else {
                const storageId = await handleSubmit();
                const encodedId = encodeURIComponent(storageId);
                redirect(`/view-provided/${encodedId}`);
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
        const storageId = uuidv4(); // Generate a unique request ID
        setLoading(true);
        try {
            await storeProjectFiles(storageId, formData.files);
            await storeProjectMetadata(storageId, formData.files)

        } catch (error) {
            console.error("Error submitting data:", error);
            setLoading(false);
        }
        return storageId;
    };

    return (<FormLayout>
        <Stepper
            steps={[""].concat(steps.map((step) => step.stepperLabel))}
            currentStep={currentStep + 1}
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

                <DisplayErrors errors={errors}/>
            </StepContainer>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between w-full mt-8">
            <Button text={currentStep === 0 ? "Exit" : "Back"} onButtonClicked={prevStep}/>
            <Button
                text={currentStep === steps.length - 1 ? "Visualize TraceLinks" : "Next"}
                onButtonClicked={nextStep}
                disabled={loading || currentStep == steps.length - 1 && errors.length > 0}
            >

            </Button>
        </div>
    </FormLayout>);
}

export default MultiStepFormLoadProject;
