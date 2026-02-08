'use client'

import Link from "next/link";

// Main Home Component
export default function Home() {
    return (
        <div className="h-full z-1 relative">
            <HeroSection/>
            <AboutSection/>
        </div>
    );
}

// Hero Section Component
function HeroSection() {
    return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="relative isolate px-6 pt-14 lg:px-8">
                <div className="mx-auto max-w-2xl py-16 sm:py-20 lg:py-24">
                    <HeroContent/>
                </div>
            </div>
        </div>
    );
}

// Hero Content Component
function HeroContent() {
    return (
        <div className="text-center">
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
                ARDoCo Trace View
            </h1>
            <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                    href="/new-project"
                    className="inline-flex justify-center items-center w-48 sm:w-56 rounded-lg border-2 border-black/30 dark:border-white/40 bg-cerulean-600 px-6 py-3 text-lg sm:px-8 sm:py-4 sm:text-xl font-semibold text-black transition-colors duration-150 hover:text-white hover:bg-lila-500 hover:border-black/50 dark:hover:border-white/60 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    Start
                </Link>
            </div>
        </div>
    );
}

// About Section Component
function AboutSection() {
    return (
        <div className="flex justify-center dark:text-white px-6 sm:px-12 pb-12 lg:px-16">
            <div className="w-full max-w-5xl text-left bg-gray-100/70 dark:bg-gray-800/60 rounded-lg p-6 sm:p-8 shadow-sm">
                <h2 className="py-4 text-xl">ARDoCo - Automating Requirements and Documentation Comprehension</h2>
                <p className="py-2">
                    ARDoCo is a research project focused on traceability link recovery and consistency analysis between software artifacts. The project connects architecture documentation and models while identifying missing or deviating elements (inconsistencies). An element can be any representable item of the model, like a component or a relation.
                </p>
                <p className="py-2">
                    ARDoCo enables traceability link recovery across various artifact types, including requirements-to-code, documentation-to-code, and architecture-to-code tracing. We provide different approaches to support your specific needs in automating comprehension and consistency analysis. You can find our detailed approaches and other information on the {' '}
                    <Link href="https://ardoco.de/approaches/" className="underline underline-offset-2 hover:opacity-80">approaches page</Link>.
                </p>
                <p className="py-2">
                    Documenting the architecture of a software system is important, especially to capture reasoning and design decisions. However, documentation is often incomplete, outdated, or missing, leading to loss of crucial knowledge and increased risks. Our long-term vision is to persist information from various sources, such as whiteboard discussions, to avoid losing essential system knowledge. A key challenge is ensuring consistency between formal artifacts (e.g., models) and informal documentation. We address this by applying natural language understanding and knowledge bases to analyze consistency and create traceability links between models and textual artifacts.
                </p>
                <p className="py-2">
                    ARDoCo is actively developed by researchers of the{' '}
                    <Link href="https://mcse.kastel.kit.edu/" className="underline underline-offset-2 hover:opacity-80">Modelling for Continuous Software Engineering</Link>
                    {' '}group of KASTEL - Institute of Information Security and Dependability at the{' '}
                    <Link href="https://www.kit.edu/" className="underline underline-offset-2 hover:opacity-80">KIT</Link>.
                </p>
            </div>
        </div>
    );
}
