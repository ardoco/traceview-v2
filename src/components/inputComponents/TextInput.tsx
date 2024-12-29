'use client'

import {useState} from "react";

interface TextInputProps {
    labelText?: string;
}

export default function TextInput({labelText}: TextInputProps) {
    const [inputText, setInputText] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
    }


    return (
        <div className="flex flex-row gap-2">
            <label htmlFor={'text'} className="text-[16px] text-transparent bg-clip-text bg-jordy_blue-300">
                {labelText}
            </label>
            <input
                type='text'
                name='text'
                placeholder={inputText}
                onChange={handleChange}
                className="bg-transparent border-2 rounded-lg p-2 text-[16px]"
            />
        </div>
    )
}