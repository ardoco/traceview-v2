import {Layout} from "@/components/inputPipeline/Layout";
import {PipelineLayout} from "@/components/inputPipeline/PipelineLayout";

export default function newUploadProject() {
    return (
        <Layout>
            <PipelineLayout>
                <h1>Add your configuration parameters for finding TraceLinks with ArDoCo! </h1>
            </PipelineLayout>
        </Layout>
    );
}