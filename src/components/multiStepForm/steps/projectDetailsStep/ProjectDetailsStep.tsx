import TextInput from "@/components/inputComponents/TextInput";
import MultiOptionSelectWithInfo from "@/components/inputComponents/RadioInput";
import {useFormContext} from "@/contexts/ProjectUploadContext";
import {canFindInconsistencies, TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";
import React from "react";
import InconsistencyCheckbox from "@/components/inputComponents/InconsistencyCheckbox";

export default function ProjectDetailsStep() {
    const {formData, updateFormData} = useFormContext();

    const checkCanBeSelected = (option: TraceLinkType) => {
        return option.checkCondition(formData.files);
    }

    // Determine if the "Find Inconsistencies" checkbox should be disabled.
    const isFindInconsistenciesDisabled = !canFindInconsistencies(formData.files);

    const handleInconsistencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateFormData({findInconsistencies: e.target.checked});
    };

    return (
        <div className="grid grid-cols-1 gap-y-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] sm:gap-x-4 sm:gap-y-6 sm:items-center">
            {/* Project Name Input */}
            <label htmlFor="project-name" className="font-medium text-gray-700">Project Name</label>
            <TextInput
                id="project-name"
                placeholderText="Enter your project name"
                value={formData.projectName}
                onChange={(e) => updateFormData({projectName: e.target.value})}
            />

            {/* Trace Link Type Selection */}
            <span id="trace-link-type-label" className="font-medium text-gray-700 mt-4 sm:mt-0">Trace Link Type</span>
            <MultiOptionSelectWithInfo
                labelledBy="trace-link-type-label"
                selectedValue={formData.selectedTraceLinkType}
                handleOptionChange={(value) => updateFormData({selectedTraceLinkType: value})}
                checkCanBeSelected={checkCanBeSelected}
                uploadedFiles={formData.files}
            />

            {/* Additional Options Label */}
            <span id="additional-options-label"
                  className={`font-medium mt-4 sm:mt-0 ${isFindInconsistenciesDisabled ? 'text-gray-500' : 'text-gray-700'}`}>
                Additional Options
            </span>

            {/* Inconsistency Checkbox Component */}
            <div role="group" aria-labelledby="additional-options-label">
                <InconsistencyCheckbox
                    checked={formData.findInconsistencies}
                    onChange={handleInconsistencyChange}
                    disabled={isFindInconsistenciesDisabled}
                />
            </div>
        </div>
    );
}