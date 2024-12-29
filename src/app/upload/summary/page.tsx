import {PipelineLayout} from "@/components/inputPipeline/PipelineLayout";
import {Layout} from "@/components/inputPipeline/Layout";

export default function newUploadProject() {
    return (
        <Layout>
            <PipelineLayout>
                <h1>Here is a summary of all the information you inserted in the last few steps. </h1>
            </PipelineLayout>
        </Layout>
    );
}