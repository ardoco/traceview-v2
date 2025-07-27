'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {TraceLinkType, TraceLinkTypes} from "@/components/dataTypes/TraceLinkTypes";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";
import {FileType} from "@/components/dataTypes/FileType";
import {useApiAddressContext} from "@/contexts/ApiAddressContext";

export interface FormData {
    projectName: string;
    selectedTraceLinkType: TraceLinkType | null;
    files: UploadedFile[];
    errors: string[];
    traceLinkConfiguration: TraceLinkConfiguration | null;
    configurationSource: 'default' | 'custom' | null;
    findInconsistencies: boolean;
}

export interface TraceLinkConfiguration {
    [key: string]: string;
}

interface FormContextProps {
    formData: FormData;
    updateFormData: (updatedData: Partial<FormData>) => void;
    configurationLoading: boolean;
    configurationError: string | null;
    originalTraceLinkConfiguration: TraceLinkConfiguration | null;
    allowedFileTypes: FileType[];
}

interface FormProviderProps {
    children: React.ReactNode;
    allowedFileTypes: FileType[];
}

const FormContext = createContext<FormContextProps | undefined>(undefined);

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within a FormProvider');
    }
    return context;
};

export function FormProvider({ children, allowedFileTypes}:FormProviderProps) {
    const [formData, setFormData] = useState<FormData>({
        projectName: '',
        selectedTraceLinkType: null,
        files: [],
        errors: [],
        traceLinkConfiguration: null,
        configurationSource: 'default',
        findInconsistencies: false,
    });

    const {apiAddress} = useApiAddressContext();
    const [configurationLoading, setConfigurationLoading] = useState(true);
    const [configurationError, setConfigurationError] = useState<string | null>(null);
    const [originalTraceLinkConfiguration, setOriginalTraceLinkConfiguration] = useState<TraceLinkConfiguration | null>(null);

    // Fetch configuration data once when the FormProvider mounts
    React.useEffect(() => {
        if (!apiAddress) return;
        console.log(apiAddress)
        const fetchConfiguration = async () => {
            try {
                const response = await fetch('/api/configuration', {
                    method: 'GET',
                    headers: {
                        'X-Target-API': apiAddress,
                    },
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: TraceLinkConfiguration = await response.json();
                setOriginalTraceLinkConfiguration(data);
                setFormData(prev => ({ ...prev, traceLinkConfiguration: data, configurationSource: 'default' }));
            } catch (e: any) {
                setConfigurationError(e.message);
            } finally {
                setConfigurationLoading(false);
            }
        };
        fetchConfiguration();
    }, [apiAddress]);

    const updateFormData = (updatedData: Partial<FormData>) => {
        setFormData((prevData) => {
            const newData = { ...prevData, ...updatedData };

            // If the selected trace link type is changing and it's not SAD_SAM,
            // automatically reset the findInconsistencies flag to false.
            if (newData.selectedTraceLinkType !== TraceLinkTypes.SAD_SAM) {
                newData.findInconsistencies = false;
            }

            console.log("Updated FormData:", newData);
            return newData;
        });
    };

    return (
        <FormContext.Provider value={{ formData, updateFormData, configurationLoading, configurationError, originalTraceLinkConfiguration, allowedFileTypes }}>
            {children}
        </FormContext.Provider>
    );
}