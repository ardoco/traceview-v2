import {ReactNode} from "react";

interface PipelineLayoutProps {
    children: ReactNode;
}

export default function PipelineLayout({children}: PipelineLayoutProps) {

    return (
        <section className='py-16 px-4 flex justify-center items-center mt-[24vh]'>
            <div className="flex flex-col justify-between items-center min-h-[300px] w-full max-w-4xl mx-auto px-6">
                {children}
            </div>
        </section>
    )
}
