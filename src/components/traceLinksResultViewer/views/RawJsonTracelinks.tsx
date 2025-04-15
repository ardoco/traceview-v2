import React from "react";

interface DisplayRawJsonTracelinksProps {
    JSONResult?: string;
}

export default function DisplayRawJsonTracelinks({JSONResult}: DisplayRawJsonTracelinksProps) {

    return (
        <div className="p-4">
            <pre>{JSONResult != null ? JSON.stringify(JSONResult, null, 2) : "Loading"}</pre>
        </div>
    )
}
