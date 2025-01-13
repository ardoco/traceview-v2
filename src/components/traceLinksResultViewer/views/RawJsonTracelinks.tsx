import React from "react";

interface DisplayRawJsonTracelinksProps {
    JSONResult: string;
}

export default function DisplayRawJsonTracelinks({JSONResult}: DisplayRawJsonTracelinksProps) {
    return (
        <div>
            <pre>{JSON.stringify(JSONResult, null, 2)}</pre>
        </div>
    )
}
