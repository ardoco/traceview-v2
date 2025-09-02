import {ReactNode} from "react";

interface PipelineLayoutProps {
    children: ReactNode;
}

export default function FormLayout({children}: PipelineLayoutProps) {

    return (
        <section className='bg-white py-16 px-4 flex justify-center items-center'>
            <div
                className="flex flex-col justify-between items-center min-h-[300px] w-full max-w-4xl mx-auto px-6 rounded-lg shadow-lg p-8">
                {children}
            </div>
        </section>
    )
}
