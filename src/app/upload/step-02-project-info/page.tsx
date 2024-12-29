import {PipelineLayout} from "@/components/inputPipeline/PipelineLayout";
import {Layout} from "@/components/inputPipeline/Layout";
import Step from "@/components/inputPipeline/Steps";
import TextInput from "@/components/inputComponents/TextInput";
import RadioInput from "@/components/inputComponents/RadioInput";

export default function newUploadProject() {
    return (
        <Layout>
            <PipelineLayout>
                <Step>
                    <div className={"flex flex-col gap-4"}>
                        <h1>Enter Project Data </h1>
                        <RadioInput/>
                    </div>
                </Step>
            </PipelineLayout>
        </Layout>
    );
}