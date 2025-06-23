// components/multiStepForm/ProjectFormContext.tsx
'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import {UploadedFile} from "@/components/dataTypes/UploadedFile";

export interface FormData {
    projectName: string;
    selectedTraceLinkType: TraceLinkType | null;
    files: UploadedFile[];
    errors: string[];
    traceLinkConfiguration: TraceLinkConfiguration | null; // This will be the ACTIVE configuration
    configurationSource: 'default' | 'custom' | null; // Tracks how the current configuration was set
}

export interface TraceLinkConfiguration {
    [key: string]: string; // Key-value pairs from your API response
}

interface FormContextProps {
    formData: FormData;
    updateFormData: (updatedData: Partial<FormData>) => void;
    configurationLoading: boolean;
    configurationError: string | null;
    originalTraceLinkConfiguration: TraceLinkConfiguration | null; // Stores the initially fetched default config
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
        errors: [],
        traceLinkConfiguration: null, // Initialize to null
        configurationSource: 'default', // Default to using default configurations
    });

    const [configurationLoading, setConfigurationLoading] = useState(true);
    const [configurationError, setConfigurationError] = useState<string | null>(null);
    const [originalTraceLinkConfiguration, setOriginalTraceLinkConfiguration] = useState<TraceLinkConfiguration | null>(null);

    // Fetch configuration data once when the FormProvider mounts
    React.useEffect(() => {
        const fetchConfiguration = async () => {
            try {
                const response = await fetch('/api/configuration');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: TraceLinkConfiguration = await response.json();
                setOriginalTraceLinkConfiguration(data); // Store the original default
                setFormData(prev => ({ ...prev, traceLinkConfiguration: data, configurationSource: 'default' })); // Set active config to default initially
            } catch (e: any) {
                setConfigurationError(e.message);
                // If fetching defaults fails, traceLinkConfiguration remains null
                // Consider adding a fallback or error handling for the configuration step here
            } finally {
                setConfigurationLoading(false);
            }
        };

        fetchConfiguration();
    }, []); // Empty dependency array means this runs once on mount

    const updateFormData = (updatedData: Partial<FormData>) => {
        setFormData((prevData) => ({
            ...prevData,
            ...updatedData,
        }));
        console.log("Updated FormData:", { ...formData, ...updatedData }); // Log updated state
    };

    return (
        <FormContext.Provider value={{ formData, updateFormData, configurationLoading, configurationError, originalTraceLinkConfiguration }}>
            {children}
        </FormContext.Provider>
    );
}