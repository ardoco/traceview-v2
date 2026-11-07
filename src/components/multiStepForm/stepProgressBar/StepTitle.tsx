interface StepTitleProps {
    title: string;
    active: boolean;
    // Steps that cannot be selected yet
    muted?: boolean;
}

export default function StepTitle({title, active, muted}: StepTitleProps) {
    return (
        <span
            className={`block text-sm sm:text-lg font-medium text-center ${
                active
                    ? "text-blau"
                    : muted ? "text-gray-500" : "text-black-700"
            }`}
        >
            {title}
        </span>
    );
}
