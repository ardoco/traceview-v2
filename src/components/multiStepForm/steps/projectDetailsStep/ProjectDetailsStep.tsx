import TextInput from "@/components/inputComponents/TextInput";
import MultiOptionSelectWithInfo from "@/components/inputComponents/RadioInput";
import {useFormContext} from "@/contexts/ProjectUploadContext";
import {TraceLinkType, TraceLinkTypes} from "@/components/dataTypes/TraceLinkTypes";
import React from "react";
import InconsistencyCheckbox from "@/components/inputComponents/InconsistencyCheckbox";

export default function ProjectDetailsStep() {
    const { formData, updateFormData } = useFormContext();

    const checkCanBeSelected = (option: TraceLinkType) => {
        return option.checkCondition(formData.files);
    }

    // Determine if the "Find Inconsistencies" checkbox should be disabled.
    const isFindInconsistenciesDisabled = formData.selectedTraceLinkType?.name !== TraceLinkTypes.SAD_SAM.name;

    const handleInconsistencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateFormData({ findInconsistencies: e.target.checked });
    };

    return (
        <div className="grid grid-cols-[30%_70%] gap-x-4 gap-y-6 items-center">
            {/* Project Name Input */}
            <label className="font-medium text-gray-700">Enter Project Name</label>
            <TextInput
                placeholderText="Enter your project name"
                value={formData.projectName}
                onChange={(e) => updateFormData({projectName: e.target.value})}
            />

            {/* Trace Link Type Selection */}
            <label className="font-medium text-gray-700 mt-6 mb-4">Select TraceLink Type</label>
            <MultiOptionSelectWithInfo
                selectedValue={formData.selectedTraceLinkType}
                handleOptionChange={(value) => updateFormData({selectedTraceLinkType: value})}
                checkCanBeSelected={checkCanBeSelected}
                uploadedFiles={formData.files}
            />

            {/* Additional Options Label */}
            <label className={`font-medium ${isFindInconsistenciesDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                Additional Options
            </label>

            {/* Inconsistency Checkbox Component */}
            <InconsistencyCheckbox
                checked={formData.findInconsistencies}
                onChange={handleInconsistencyChange}
                disabled={isFindInconsistenciesDisabled}
            />
        </div>
    );
}