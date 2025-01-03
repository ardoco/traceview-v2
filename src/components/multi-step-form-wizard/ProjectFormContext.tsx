// ProjectFormContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FormData {
    projectName: string;
    selectedTraceLinkType: string | null;
    files: File[];
}

interface FormContextProps {
    formData: FormData;
    updateFormData: (updatedData: Partial<FormData>) => void;
}

const FormContext = createContext<FormContextProps | undefined>(undefined);

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
};

export const FormProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [formData, setFormData] = useState<FormData>({
        projectName: '',
        selectedTraceLinkType: null,
        files: [],
    });

    const updateFormData = (updatedData: Partial<FormData>) => {
        setFormData((prevData) => ({
            ...prevData,
            ...updatedData,
        }));
    };

    return (
        <FormContext.Provider value={{ formData, updateFormData }}>
            {children}
        </FormContext.Provider>
    );
};
