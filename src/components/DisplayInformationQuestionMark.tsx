import React, {ReactElement} from "react";
import {InformationCircleIcon} from "@heroicons/react/24/outline";

interface DisplayInformationQuestionMarkProps {
    title: string;
    descriptionToRender: ReactElement;
    disabled?: boolean;
}

export function DisplayInformationQuestionMark({
                                                   title,
                                                   descriptionToRender,
                                                   disabled
                                               }: DisplayInformationQuestionMarkProps) {
    return (
        <div className="relative group ml-auto">
            <InformationCircleIcon
                aria-label={title}
                className={`size-6 cursor-pointer ${disabled ? 'text-gray-400' : 'text-blau-500'}`}
            />
            <div
                className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-white border border-gray-300 p-3 rounded-md shadow-lg z-10 w-96">
                <p className="font-bold mb-1 text-gray-800">{title}</p>
                <div className="text-sm text-gray-600">
                    {descriptionToRender}
                </div>

            </div>
        </div>
    );
}