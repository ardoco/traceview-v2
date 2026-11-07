import React, {useId, useState} from "react";

interface Instruction {
    keyCombo?: string; // e.g., "Ctrl + Click"
    description: string;
}

interface TooltipInstructionProps {
    title?: string;
    instructions: Instruction[];
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"; // Optional
}

/**
 * A "?" button that shows usage instructions on hover, on focus and on click. Escape or leaving the button hides them.
 */
export default function TooltipInstruction({
                                               title = "Instructions",
                                               instructions,
                                               position = "bottom-right"
                                           }: TooltipInstructionProps) {
    const [open, setOpen] = useState(false);
    const tooltipId = useId();
    const positionClasses = {
        "top-left": "top-4 left-4",
        "top-right": "top-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "bottom-right": "bottom-4 right-4",
    };

    return (
        <div className={`absolute ${positionClasses[position]} z-10 group`}>
            <button
                type="button"
                aria-label={title}
                aria-describedby={tooltipId}
                aria-expanded={open}
                onFocus={() => setOpen(true)}
                onClick={() => setOpen(true)}
                onKeyDown={(e) => {
                    if (e.key === "Escape") setOpen(false);
                }}
                onBlur={() => setOpen(false)}
                className="w-6 h-6 rounded-full bg-gray-300 text-black text-center cursor-pointer leading-6 font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blau-500"
            >
                ?
            </button>
            <div
                id={tooltipId}
                role="tooltip"
                className={`absolute bottom-8 right-0 w-64 text-sm text-white bg-black/80 p-3 rounded-md transition-opacity duration-300 pointer-events-none group-hover:opacity-100 ${open ? "opacity-100" : "opacity-0"}`}
            >
                <strong className="block font-semibold mb-2">{title}</strong>
                {instructions.map((inst, idx) => (
                    <div key={idx}>
                        {inst.keyCombo && (
                            <kbd className="font-mono">{inst.keyCombo}</kbd>
                        )}
                        {inst.keyCombo ? ": " : ""}
                        {inst.description}
                    </div>
                ))}
            </div>
        </div>
    );
}
