'use client';

interface StepContainerProps {
    children: React.ReactNode;
}

export default function StepContainer({children}: StepContainerProps) {
    return (
        <div className="content-center flex flex-col gap-8 w-[82%] sm:w-[100%]">
            {/* Pass various types of input through the children prop */}
            <div className="w-full">{children}</div>
        </div>
    );
}
