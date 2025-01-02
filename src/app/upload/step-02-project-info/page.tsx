'use client'

import {PipelineLayout} from "@/components/inputPipeline/PipelineLayout";
import {Layout} from "@/components/inputPipeline/Layout";
import Step from "@/components/inputPipeline/Steps";
import TextInput from "@/components/inputComponents/TextInput";
import MultiOptionSelectWithInfo from "@/components/inputComponents/RadioInput2";

export default function newUploadProject() {
    return (
        <div>
            <Layout>
                <PipelineLayout>
                    <Step>
                        <div className="flex flex-col gap-6">
                            {/* Page Title */}
                            <h1 className="text-2xl font-bold">Project Info</h1>

                            {/* Text Input Section */}
                            <div>
                                <h2 className="text-lg font-semibold"> Enter Project Name</h2>
                                <TextInput placeholderText="Project Name"/>
                            </div>

                            {/* MultiOptionSelect Section */}
                            <div>
                                <h2 className="text-lg font-semibold">Select TraceLinkType</h2>
                                <MultiOptionSelectWithInfo />
                            </div>
                        </div>
                    </Step>
                </PipelineLayout>
            </Layout>
        </div>
    );
}
