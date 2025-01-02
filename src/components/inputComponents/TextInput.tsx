'use client'

import {useState} from "react";

interface TextInputProps {
    labelText?: string;
    placeholderText?: string;
}

export default function TextInput({labelText, placeholderText}: TextInputProps) {
    const [inputText, setInputText] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
    }

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor="text" className="text-[16px] text-gray-700 font-medium">
                {labelText}
            </label>
            <input
                type="text"
                name="text"
                value={inputText}
                placeholder={placeholderText}
                onChange={handleChange}
                className="bg-gray-100 border-2 rounded-lg p-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}
