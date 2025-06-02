import React from "react";

interface Instruction {
    keyCombo?: string; // e.g., "Ctrl + Click"
    description: string;
}

interface TooltipInstructionProps {
    title?: string;
    instructions: Instruction[];
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right"; // Optional
}

export default function TooltipInstruction({
                                               title = "Instructions",
                                               instructions,
                                               position = "bottom-right"
                                           }: TooltipInstructionProps) {
    const positionClasses = {
        "top-left": "top-4 left-4",
        "top-right": "top-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "bottom-right": "bottom-4 right-4",
    };

    return (
        <div className={`absolute ${positionClasses[position]} z-10 group`}>
            <div className="w-6 h-6 rounded-full bg-gray-300 text-black text-center cursor-pointer leading-6 font-bold">
                ?
            </div>
            <div className="absolute bottom-8 right-0 w-64 text-sm text-white bg-black bg-opacity-80 p-3 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
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
