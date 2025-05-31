'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";

interface FormData {
    projectName: string;
    selectedTraceLinkType: TraceLinkType | null;
    files: UploadedFile[];
    errors: string[]
}

interface FormContextProps {
    formData: FormData;
    updateFormData: (updatedData: Partial<FormData>) => void;
}

interface FormProviderProps {
    children: React.ReactNode;
}

const FormContext = createContext<FormContextProps | undefined>(undefined);

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
};

export function FormProvider({ children}:FormProviderProps) {
    const [formData, setFormData] = useState<FormData>({
        projectName: '',
        selectedTraceLinkType: null,
        files: [],
        errors: []
    });

    const updateFormData = (updatedData: Partial<FormData>) => {
        setFormData((prevData) => ({
            ...prevData,
            ...updatedData,
        }));
        console.log(formData);
    };

    return (
        <FormContext.Provider value={{ formData, updateFormData }}>
            {children}
        </FormContext.Provider>
    );
};
