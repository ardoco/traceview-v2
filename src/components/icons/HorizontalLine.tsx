interface HorizontalLineProps {
    active: boolean
}

export default function HorizontalLine({active}: HorizontalLineProps) {
    return (
        <div
            className={`h-[4px] w-[30px] ml-2 rounded ${
                active
                    ? "bg-linear-to-r from-sky-400 via-30% to-emerald-400 to-90%"
                    : "bg-sky-300 opacity-25"
            } `}

        />
    )
}