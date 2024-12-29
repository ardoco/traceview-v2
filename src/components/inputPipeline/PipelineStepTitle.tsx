interface StepTitleProps {
    title: string
    active: boolean
}


export default function PipelineStepTitle({title, active}: StepTitleProps) {
    return (
        <h2 className={`text-xl ${
            active 
                ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%" 
                : "text-zinc-100"
            }`}
        >
            {title}
        </h2>
    )
}