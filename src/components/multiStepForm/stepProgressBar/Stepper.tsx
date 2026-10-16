import {Dot} from "@/components/icons/dot";
import StepTitle from "@/components/multiStepForm/stepProgressBar/StepTitle";

interface StepperProps {
    steps: string[];
    currentStep: number;
    onStepChange: (step: number) => void;
    // Whether the user may jump to the given step. Defaults to earlier steps only.
    isStepReachable?: (step: number) => boolean;
}

/**
 * This is the multi-step progress bar.
 * Only reachable steps (earlier or already completed ones) are rendered as buttons.
 */
export default function Stepper({steps, currentStep, onStepChange, isStepReachable}: StepperProps) {
    const canGoTo = (index: number) => index !== currentStep && (isStepReachable ? isStepReachable(index) : index < currentStep);

    return (
        <nav aria-label="Progress" className="relative flex flex-col items-center w-full">
            {/* Step Dots and Bars */}
            <div className="flex items-center justify-between w-10/12" aria-hidden="true">
                {Array.from({length: steps.length - 1}, (_, index) => (
                    <div key={index} className="flex items-center w-full">
                        <Dot active={index <= currentStep} passed={index < currentStep}/>

                        {/* Line */}
                        <div
                            className={`h-1 w-full ${
                                index <= currentStep - 1 ? index < currentStep - 1 ? "bg-blau" : "bg-gradient-to-r from-blau to-gruen" : "bg-black-900"
                            }`}
                        />
                    </div>
                ))}

                {/*last dot*/}
                <div className="justify-end">
                    <Dot active={currentStep === steps.length - 1}/>
                </div>
            </div>

            {/* Step Titles */}
            <ol className="flex items-start justify-between w-11/12 mt-2">
                {steps.map((step, index) => (
                    <li
                        key={index}
                        className="relative flex flex-col items-center min-w-[64px] sm:min-w-[80px] text-center"
                        aria-current={index === currentStep ? "step" : undefined}
                    >
                        {canGoTo(index) ? (
                            <button
                                type="button"
                                onClick={() => onStepChange(index)}
                                className="rounded-md px-1 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blau-500"
                            >
                                <StepTitle active={false} title={step}/>
                            </button>
                        ) : (
                            <StepTitle active={index === currentStep} title={step} muted={index > currentStep}/>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    )
}
