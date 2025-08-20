'use client';

import React, {useEffect, useState} from 'react';
import {useFormContext} from "@/contexts/ProjectUploadContext";
import ConfigurationSourceSelector from './ConfigurationSourceSelector';
import CustomizationTabs from './CustomizationTabs';
import FileUploadSection from './FileUploadSection';
import ManualInputSection from './ManualInputSection';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';
import {ConfigurationMethod} from "@/components/multiStepForm/steps/configurationStep/ConfigurationMethod";

export default function ConfigurationStep() {
    const {
        formData,
        updateFormData,
        configurationLoading,
        configurationError,
        originalTraceLinkConfiguration
    } = useFormContext();

    const [fileParseError, setFileParseError] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [configurationSource, setConfigurationSource] = useState<ConfigurationMethod>(ConfigurationMethod.DEFAULT);
    const isUsingFileUpload = configurationSource === ConfigurationMethod.FILE_UPLOAD;
    const isUsingManualInput = configurationSource === ConfigurationMethod.MANUAL_INPUT;
    const isUsingDefaults = configurationSource === ConfigurationMethod.DEFAULT;

    useEffect(() => {
        if (isUsingDefaults && originalTraceLinkConfiguration && !formData.traceLinkConfiguration) {
            updateFormData({traceLinkConfiguration: originalTraceLinkConfiguration});
        }
    }, [isUsingDefaults, originalTraceLinkConfiguration, formData.traceLinkConfiguration, updateFormData]);

    const handleFileChange = (files: FileList) => {
        if (files.length === 0) {
            setUploadedFile(null);
            setFileParseError(null);
            return;
        }

        const file = files[0];
        setUploadedFile(file);
        setFileParseError(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const parsed = JSON.parse(e.target?.result as string);
                updateFormData({traceLinkConfiguration: parsed});
            } catch {
                setFileParseError('Error parsing JSON file. Please ensure it is a valid JSON.');
            }
        };
        reader.onerror = () => {
            setFileParseError('Error reading file. Please try again.');

        };
        reader.readAsText(file);
    };

    const handleResetToDefault = () => {
        setUploadedFile(null);
        setFileParseError(null);
        updateFormData({
            traceLinkConfiguration: originalTraceLinkConfiguration
        });
    };

    if (configurationLoading) return <LoadingState/>;
    if (configurationError) return <ErrorState message={configurationError}/>;

    return (
        <div className="flex flex-col items-center p-6 rounded-lg min-h-[400px]">
            <ConfigurationSourceSelector
                currentMethod={configurationSource}
                setMethod={setConfigurationSource}
                setToDefault={handleResetToDefault}
            />

            {!isUsingDefaults && (<CustomizationTabs
                    currentMethod={configurationSource}
                    setMethod={setConfigurationSource}
                />
            )}

            {isUsingFileUpload && (
                <FileUploadSection
                    uploadedFile={uploadedFile}
                    fileParseError={fileParseError}
                    handleFileChange={handleFileChange}
                />
            )}

            {isUsingManualInput && (
                <ManualInputSection
                    onReset={handleResetToDefault}
                />
            )}

        </div>
    );
}
