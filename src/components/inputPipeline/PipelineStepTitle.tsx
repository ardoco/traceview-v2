interface StepTitleProps {
    title: string;
    active: boolean;
}

export default function PipelineStepTitle({ title, active }: StepTitleProps) {
    return (
        <h2
            className={`text-base sm:text-lg font-medium text-center ${
                active
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500"
                    : "text-zinc-400"
            }`}
        >
            {title}
        </h2>
    );
}
