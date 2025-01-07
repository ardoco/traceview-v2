interface DotProps {
    active: boolean
}

export const Dot = ({ active }: DotProps) => {
    return (
        <div
            className={`w-3 h-3 rounded-full ${
                active ? "bg-maigruen" : "bg-black-900"
            }`}
        ></div>
    )
}
