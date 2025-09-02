'use client'

interface Props {
    text: string;
    onButtonClicked?: () => void;
    disabled?: boolean;
}


function Button({text, onButtonClicked, disabled}: Props) {
    return (
        <button
            disabled={disabled}
            className="flex items-center justify-center gap-x-6 bg-blau-500 text-white p-2 px-4 rounded-lg
            enabled:hover:bg-blau-400 enabled:hover:outline-2 outline-offset-2 outline-blau-400 disabled:bg-blau-800"
            onClick={onButtonClicked}>{text}
        </button>
    );
}

export default Button;