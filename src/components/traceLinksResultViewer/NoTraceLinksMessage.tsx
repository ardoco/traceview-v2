import React from "react";

export default function NoTraceLinksMessage() {

    return (
        <div
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out-vibrate z-50"
        >
            No trace links found.
        </div>
    )
}
