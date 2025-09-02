interface StepTitleProps {
    title: string;
    active: boolean;
}

export default function StepTitle({title, active}: StepTitleProps) {
    return (
        <h2
            className={`text-base sm:text-lg font-medium text-center ${
                active
                    ? "text-blau bg-clip-text"
                    : "text-black-700"
            }`}
        >
            {title}
        </h2>
    );
}
