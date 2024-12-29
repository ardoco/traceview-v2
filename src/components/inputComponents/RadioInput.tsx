'use client'

import {useState} from "react";

interface RadioInputProps {
    labelText?: string;
}

export default function RadioInput({labelText}: RadioInputProps) {
    const [inputText, setInputText] = useState<string>("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
    }


    return (
        <form className="flex flex-col">


            <label>
                <input
                    type="radio"
                    name="react-tips"
                    value="option1"
                    checked={true}
                    className="form-check-input"
                />
                Option 1
            </label>

            <label>
                <input
                    type="radio"
                    name="react-tips"
                    value="option2"
                    className="form-check-input"
                />
                Option 2
            </label>

            <label>
                <input
                    type="radio"
                    name="react-tips"
                    value="option2"
                    className="form-check-input"
                />
                Option 3
            </label>

        </form>
    )
}