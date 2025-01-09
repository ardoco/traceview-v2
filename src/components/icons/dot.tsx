interface DotProps {
    passed?: boolean,
    active: boolean
}

export const Dot = ({ active, passed }: DotProps) => {
    return (
        <div
            className={`w-3 h-3 rounded-full ${
                active ? passed ? "bg-blau" : "bg-gruen" : "bg-black-900"
            }`}
        ></div>
    )
}
