'use client';

import { ReactNode } from "react";
import Link from "next/link";
import { Dot } from "@/components/icons/dot";
import { usePathname } from "next/navigation";
import PipelineStepTitle from "@/components/inputPipeline/PipelineStepTitle";
import HorizontalLine from "@/components/icons/HorizontalLine";
import NavigationButtons from "@/components/inputPipeline/navigationButtons";

interface PipelineLayoutProps {
    children: ReactNode;
}

/**
 * This component is used for all pages that are part of the multi-part form. It is a specific layout for steps with progression bar.
 * It is made of the three links (progress steps) that direct to each step of the form, a child component (the content of the current step) and the navigation buttons
 * @param children
 * @constructor
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
    const link_to_next = activeStep === stepPaths.length? "/view" : stepPaths[activeStep + 1];

    return (
        <div className="flex flex-col justify-between items-center min-h-[300px] w-[70%] sm:w-[80%] mx-auto p-6">
            {/* Horizontal pipeline steps */}
            <div className="flex items-center justify-between px-6 py-4 w-full border-b-2 border-blue-200 border-dashed">
                {/* Step for the file upload */}
                <Link href="/upload/step-01-file-upload">
                    <div className="flex flex-col items-center gap-2">
                        <Dot active={activeStep >= 0} />
                        <PipelineStepTitle active={activeStep === 0} title="Step 0" />
                    </div>
                </Link>

                <HorizontalLine active={activeStep >= 1}/>

                {/* Step for project details */}
                <Link href="/upload/step-02-project-info">
                    <div className="flex flex-col items-center gap-2">
                        <Dot active={activeStep >= 1} />
                        <PipelineStepTitle active={activeStep === 1} title="Step 1" />
                    </div>
                </Link>

                <HorizontalLine active={activeStep >= 2}/>

                {/* Step for configuration file */}
                <Link href="/upload/step-03-configuration">
                    <div className="flex flex-col items-center gap-2">
                        <Dot active={activeStep >= 2} />
                        <PipelineStepTitle active={activeStep === 2} title="Step 2" />
                    </div>
                </Link>

                <HorizontalLine active={activeStep >= 3}/>

                {/* Summary step */}
                <Link href="/upload/summary">
                    <div className="flex flex-col items-center gap-2">
                        <Dot active={activeStep >= 3} />
                        <PipelineStepTitle active={activeStep === 3} title="Step 3" />
                    </div>
                </Link>
            </div>

            {/* Content form */}
            <form className=" content-center flex w-full mt-8">{children}</form>
            <NavigationButtons link_back={link_back} link_to_next={link_to_next} finish={activeStep === 3}/>
        </div>
    );
};
