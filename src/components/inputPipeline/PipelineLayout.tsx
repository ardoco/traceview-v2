'use client';

import { ReactNode } from "react";
import { Dot } from "@/components/icons/dot";
import { usePathname } from "next/navigation";
import PipelineStepTitle from "@/components/inputPipeline/PipelineStepTitle";
import NavigationButtons from "@/components/inputPipeline/navigationButtons";

interface PipelineLayoutProps {
    children: ReactNode;
}

/**
 * Multi-step progress layout for the upload process.
 */
export const PipelineLayout = ({ children }: PipelineLayoutProps) => {
    const pathname = usePathname();

    // Define step mapping
    const stepPaths = [
        "/upload/step-01-file-upload",
        "/upload/step-02-project-info",
        "/upload/step-03-configuration",
        "/upload/summary",
    ];

    // Find the active step index
    const activeStep = stepPaths.indexOf(pathname);
    const link_back = activeStep === 0 ? "/" : stepPaths[activeStep - 1];
    const link_to_next = activeStep === stepPaths.length - 1 ? "/view" : stepPaths[activeStep + 1];

    const filteredStepPaths = stepPaths.slice(0, stepPaths.length - 1);

    return (
        <div className="flex flex-col justify-between items-center min-h-[300px] w-full max-w-4xl mx-auto px-6">
            {/* Multi-step progress bar */}
            <div className="relative flex flex-col items-center w-full">
                {/* Step Dots and Bars */}
                <div className="flex items-center justify-between w-10/12">
                    {filteredStepPaths.map((step, index) => (
                        <div key={index} className="flex items-center w-full">
                                {/* Dot */}
                                <Dot active={index <= activeStep} />

                                {/* Line (only for steps that are not the last dot) */}
                                {index < stepPaths.length - 1 && (
                                    <div
                                        className={`h-1 w-full ${
                                            index < activeStep ? "bg-blue-500" : "bg-gray-300"
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                        {/*last dot*/}
                        <div className="justify-end">
                            <Dot active={activeStep === stepPaths.length - 1} />
                        </div>

                    </div>

                    {/* Step Titles */}
                    <div className="flex items-center justify-between w-11/12 mt-2">
                        {stepPaths.map((step, index) => (
                            <div
                                key={index}
                                className="relative flex flex-col items-center min-w-[80px] text-center"
                            >
                                <PipelineStepTitle
                                    active={index === activeStep}
                                    title={`Step ${index}`}
                                />
                            </div>
                        ))}
                    </div>
                </div>

            {/* Content form */}
            <form className="content-center flex w-full mt-8">{children}</form>

            {/* Navigation Buttons */}
            <div className="flex justify-between w-full mt-4">
                <NavigationButtons
                    link_back={link_back}
                    link_to_next={link_to_next}
                    finish={activeStep === stepPaths.length - 1}
                />
            </div>
        </div>
    );
};
