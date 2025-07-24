'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext } from "@/contexts/ProjectFormContext";
import ConfigurationSourceSelector from './ConfigurationSourceSelector';
import CustomizationTabs from './CustomizationTabs';
import FileUploadSection from './FileUploadSection';
import ManualInputSection from './ManualInputSection';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

export default function ConfigurationStep() {
    const {
        formData,
        updateFormData,
        configurationLoading,
        configurationError,
        originalTraceLinkConfiguration
    } = useFormContext();

    const isUsingDefaults = formData.configurationSource === 'default';
    const isCustomizing = formData.configurationSource === 'custom';

    const [customizationMethod, setCustomizationMethod] = useState<'manual' | 'file_upload'>(() =>
        isCustomizing && formData.traceLinkConfiguration && Object.keys(formData.traceLinkConfiguration).length > 0
            ? 'manual'
            : 'file_upload'
    );

    const [fileParseError, setFileParseError] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    useEffect(() => {
        if (isUsingDefaults && originalTraceLinkConfiguration && !formData.traceLinkConfiguration) {
            updateFormData({ traceLinkConfiguration: originalTraceLinkConfiguration });
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
                updateFormData({ configurationSource: 'custom', traceLinkConfiguration: parsed });
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
            configurationSource: 'custom',
            traceLinkConfiguration: originalTraceLinkConfiguration
        });
        setCustomizationMethod('manual');
    };

    if (configurationLoading) return <LoadingState />;
    if (configurationError) return <ErrorState message={configurationError} />;

    return (
        <div className="flex flex-col items-center p-6 rounded-lg min-h-[400px]">
            <ConfigurationSourceSelector
                currentSource={formData.configurationSource}
                setToDefault={() =>
                    updateFormData({
                        configurationSource: 'default',
                        traceLinkConfiguration: originalTraceLinkConfiguration
                    })
                }
                setToCustom={() => {
                    updateFormData({ configurationSource: 'custom' });
                    if (!formData.traceLinkConfiguration) setCustomizationMethod('file_upload');
                }}
            />

            {isCustomizing && (
                <>
                    <CustomizationTabs
                        currentMethod={customizationMethod}
                        setMethod={setCustomizationMethod}
                    />

                    {customizationMethod === 'file_upload' && (
                        <FileUploadSection
                            uploadedFile={uploadedFile}
                            fileParseError={fileParseError}
                            handleFileChange={handleFileChange}
                        />
                    )}

                    {customizationMethod === 'manual' && (
                        <ManualInputSection
                            config={formData.traceLinkConfiguration}
                            updateFormData={updateFormData}
                            onReset={handleResetToDefault}
                        />
                    )}
                </>
            )}
        </div>
    );
}
