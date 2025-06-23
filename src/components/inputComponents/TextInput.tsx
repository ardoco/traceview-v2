'use client'

interface TextInputProps {
    placeholderText?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TextInput({ placeholderText, value, onChange }: TextInputProps) {
    return (
        <input
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholderText}
            className="w-full p-3 border shadow-xs border-gray-200 rounded-lg text-sm focus:border-blau-500 focus:ring-1 focus:ring-blau-500 focus:outline-hidden transition-all"
        />
    );
}


