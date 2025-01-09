import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

// Main Home Component
export default function Home() {
    return (
        <div className="h-full z-1 relative">
            <HeroSection />
            <AboutSection />
        </div>
    );
}

// Hero Section Component
function HeroSection() {
    return (
        <div className="flex justify-center items-center h-5/6">
            <div className="relative isolate px-6 pt-14 lg:px-8">
                {/*<BackgroundBlur position="top" />*/}
                <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
                    <HeroContent />
                </div>
                {/*<BackgroundBlur position="bottom" />*/}
            </div>
        </div>
    );
}

// Hero Content Component
function HeroContent() {
    return (
        <div className="text-center">
            <h1 className="text-balance text-5xl font-semibold tracking-tight text-gray-900 sm:text-7xl">
                ArDoCo Trace View
            </h1>
            <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                    href="/new-project"
                    className="rounded-md bg-cerulean-600 px-3.5 py-2.5 text-sm font-semibold text-black shadow-xs hover:text-white hover:bg-lila-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    Start
                </Link>
                <Link href="https://ardoco.de/" className="text-sm font-semibold text-black-600 hover:text-black">
                    About ArDoCo <span>→</span>
                </Link>
            </div>
        </div>
    );
}

// Background Blur Component
function BackgroundBlur({ position }: { position: "top" | "bottom" }) {
    const styles = {
        top: {
            className: "absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80",
            clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
        },
        bottom: {
            className: "absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]",
            clipPath: "",
        },
    };

    return (
        <div
            aria-hidden="true"
            className={styles[position].className}
            style={{
                clipPath: styles[position].clipPath || undefined,
            }}
        >
            <div
                className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-linear-to-tr from-dark_magenta-600 to-jordy_blue-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
        </div>
    );
}

// About Section Component
function AboutSection() {
    return (
        <div className="flex items-center justify-center gap-x-6 dark:text-white px-12 pb-12 lg:px-16 flex-col">
            <h2 className="text-left py-4 text-xl self-start">ArDoCo - Architecture Documentation Consistency</h2>
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
                ArDoCo is actively developed by researchers of the Modelling for Continuous Software Engineering
                (MCSE) group of KASTEL - Institute of Information Security and Dependability at the KIT.
            </p>
        </div>
    );
}
