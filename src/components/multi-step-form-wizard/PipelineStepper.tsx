import {Dot} from "@/components/icons/dot";
import PipelineStepTitle from "@/components/inputPipeline/PipelineStepTitle";

interface PipelineStepperProps {
    steps: string[];
    currentStep: number;
    onStepChange: (step: number) => void;
}

/**
 * This is the multi-step progress bar
 * @param steps
 * @param currentStep
 * @constructor
 */
export default function PipelineStepper({steps, currentStep, onStepChange}: PipelineStepperProps) {

    return (
        <div className="relative flex flex-col items-center w-full">
            {/* Step Dots and Bars */}
            <div className="flex items-center justify-between w-10/12">
                {Array.from({length: steps.length - 1}, (_, index) => (
                    <div
                        key={index}
                        className="flex items-center w-full"
                        onClick={() => onStepChange(index)}
                    >
                        <Dot active={index <= currentStep}/>

                        {/* Line */}
                        <div
                            className={`h-1 w-full ${
                                index < currentStep ? "bg-blue-500" : "bg-gray-300"
                            }`}
                        />
                    </div>
                ))}

                {/*last dot*/}
                <div className="justify-end" onClick={() => onStepChange(steps.length - 1)}>
                    <Dot active={currentStep === steps.length - 1}/>
                </div>

            </div>

            {/* Step Titles */}
            <div className="flex items-center justify-between w-11/12 mt-2">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="relative flex flex-col items-center min-w-[80px] text-center"
                        onClick={() => onStepChange(index)}
                    >
                        <PipelineStepTitle
                            active={index === currentStep}
                            title={step}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}