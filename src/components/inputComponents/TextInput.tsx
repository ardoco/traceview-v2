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
            className="w-full p-3 border border-blue-500 rounded-lg shadow-xs text-sm focus:ring-2 focus:ring-blue-600 focus:outline-hidden transition-all"
        />
    );
}


