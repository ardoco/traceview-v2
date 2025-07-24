import TextInput from "@/components/inputComponents/TextInput";
import MultiOptionSelectWithInfo from "@/components/inputComponents/RadioInput";
import {useFormContext} from "@/contexts/ProjectFormContext";
import {TraceLinkType} from "@/components/dataTypes/TraceLinkTypes";

export default function ProjectDetailsStep() {
    const { formData, updateFormData } = useFormContext();

    const checkCanBeSelected = (option: TraceLinkType) => {
        return option.checkCondition(formData.files);
    }

    return (
        <div className="grid grid-cols-[30%_70%] gap-x-4 gap-y-6 items-center">
            <label className="font-medium text-gray-700">Enter Project Name</label>

            <TextInput
                placeholderText="Enter your project name"
                value={formData.projectName}
                onChange={(e) => updateFormData({projectName: e.target.value})}
            />
            <label className=" font-medium text-gray-700 mt-6 mb-4">Select TraceLink Type</label>
            <MultiOptionSelectWithInfo
                selectedValue={formData.selectedTraceLinkType}
                handleOptionChange={(value) => updateFormData({selectedTraceLinkType: value})}
                checkCanBeSelected={checkCanBeSelected}
                uploadedFiles={formData.files}
            />
        </div>
    );
}