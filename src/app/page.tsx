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
                    In this research project, we aim to provide consistency analyses between different kinds of
                    documentation, namely formal models and informal (textual) documentation.
                </p>
                <p className="py-2">
                    Documenting the architecture of a software system is important, especially to capture reasoning
                    and design decisions. A lot of tacit knowledge is easily lost when the documentation is
                    incomplete, resulting in threats for the software system’s success and increased costs. However,
                    software architecture documentation is often missing or outdated. One explanation for this
                    phenomenon is the tedious and costly process of creating documentation in comparison to
                    (perceived) low beneﬁts. With our project, we want to step forward in our long-term vision,
                    where we plan to persist information from any sources, e.g., from whiteboard discussions, to
                    avoid losing crucial information about a system. A core problem in this vision is the possible
                    inconsistency of information from different sources. A major challenge of ensuring consistency
                    is the consistency between formal artefacts, i.e., models, and informal documentation. We plan to
                    address consistency analyses between models and textual natural language artefacts using natural
                    language understanding and plan to include knowledge bases to improve these analyses. After
                    extracting information out of the natural language documents, we plan to create traceability
                    links and check whether statements within the textual documentation are consistent with the
                    software architecture models.
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
