import {Layout} from "@/components/inputPipeline/Layout";
import {PipelineLayout} from "@/components/inputPipeline/PipelineLayout";
import Step from "@/components/inputPipeline/Steps";
import TextInput from "@/components/inputComponents/TextInput";
import DragAndDrop from "@/components/drag-and-drop/drag-and-drop";

export default function newUploadProject() {


    return (
        <Layout>
            <PipelineLayout>
                <Step link_back="/" link_to_next="/upload/step-02-project-info">
                    <div className={"flex flex-col gap-4"}>
                        <h1>Upload project files! </h1>
                        <DragAndDrop/>
                    </div>
                </Step>
            </PipelineLayout>
        </Layout>
    );
}