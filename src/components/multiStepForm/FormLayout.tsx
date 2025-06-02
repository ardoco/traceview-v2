import {ReactNode} from "react";

interface PipelineLayoutProps {
    children: ReactNode;
}

export default function FormLayout({children}: PipelineLayoutProps) {

    return (
        <section className='py-16 px-4 flex justify-center items-center'>
            <div className="flex flex-col justify-between items-center min-h-[300px] w-full max-w-4xl mx-auto px-6">
                {children}
            </div>
        </section>
    )
}
