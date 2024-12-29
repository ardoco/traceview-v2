'use client'

import { ReactNode } from "react";
import Link from "next/link";
import {Dot} from "@/components/icons/dot";
import {VerticalLine} from "@/components/icons/VerticalLine";
import {usePathname} from "next/navigation";
import PipelineStepTitle from "@/components/inputPipeline/PipelineStepTitle";

interface PipelineLayoutProps {
    children: ReactNode; // the child component (e-g the step that should be rendered
}

/**
 * This component is used for all pages that are part of the multi-part form. It is a specific layout for steps with progression bar
 * It is made of the three links (progress steps) that direct to each step of the form and
 * a children components
 * @param children
 * @constructor
 */
export const PipelineLayout = ({ children }: PipelineLayoutProps) => {

    // use router hook from next.js to access the current path
    const pathname = usePathname();

    // Define step mapping
    const stepPaths = [
        "/upload/step-01-file-upload",
        "/upload/step-02-project-info",
        "/upload/step-03-configuration",
        "/upload/summary",
    ];

    // TODO: instead of step 1, step2, ... maybe  combine the step paths with the name for the step

    // Find the active step index (TODO: is there maybe a better way like finding out what the children component is? because this is not very flexible and ugly)
    const activeStep = stepPaths.indexOf(pathname);

    return (
        <article className="flex justify-start gap-22 w-[82%] sm:w-[100%]">
            <div className="min-w-[24%] flex flex-row px-6 py-6 mx-20 h-[200px] border-r-2 border-blue-200 border-dashed">

                {/*Step for the file upload*/}
                <Link href="/upload/step-01-file-upload">
                    <div className='flex items-center gap-4'>
                        <Dot active={activeStep >= 0} />
                        <PipelineStepTitle active={activeStep === 0} title="Step 0"/>
                    </div>
                </Link>

                <VerticalLine active={activeStep >= 1} />

                {/*Step for project details*/}
                <Link href="/upload/step-02-project-info">
                    <div className='flex items-center gap-4'>
                        <Dot active={activeStep >= 1}/>
                        <PipelineStepTitle active={activeStep === 1} title="Step 1"/>
                    </div>
                </Link>

                <VerticalLine active={activeStep >= 2} />

                {/*Step to the configuration file*/}
                <Link href="/upload/step-03-configuration">
                    <div className='flex items-center gap-4'>
                        <Dot active={activeStep >= 2}/>
                        <PipelineStepTitle active={activeStep === 2} title="Step 2"/>
                    </div>
                </Link>

                <VerticalLine active={activeStep >= 3} />

                {/*Summary step*/}
                <Link href="/upload/summary">
                    <div className='flex items-center gap-4'>
                        <Dot active={activeStep >= 3}/>
                        <PipelineStepTitle active={activeStep === 3} title="Step 3"/>
                    </div>
                </Link>
            </div>

            <form>{children}</form>

        </article>
    )
}