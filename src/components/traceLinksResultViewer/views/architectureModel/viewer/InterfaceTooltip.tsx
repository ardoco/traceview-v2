import React from "react";

import {Interface} from "@/components/traceLinksResultViewer/views/architectureModel/dataModel/ArchitectureDataModel";

export function showInterfaceTooltip(
    svgRef: React.RefObject<SVGSVGElement> | null,
    x: number,
    y: number,
    usedInterface: Interface,
    setTooltip: (t: { x: number; y: number; content: React.ReactNode } | null) => void,
    description: "Provided" | "Required"
) {
    if (svgRef?.current) {

        setTooltip({
            x: x,
            y: y,
            content: (
                <div
                    style={{
                        fontSize: "14px",
                        lineHeight: "1.4",
                        color: "#333",
                    }}
                >
                    <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                        {description} Interface:
                    </div>
                    <div style={{ marginBottom: 8 }}>{usedInterface.name}</div>
                    <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                        Operations:
                    </div>
                    { usedInterface.ownedOperations.length === 0 ? (
                    <ul style={{ paddingLeft: 20, margin: 0 }}>
                        {usedInterface.ownedOperations.map((op) => (
                            <li key={op.id} style={{ marginBottom: 2 }}>
                                {op.name}
                            </li>
                        ))}
                    </ul>) : <span>-</span>
                    }
                </div>
            ),
        });
    }
}

export function hideTooltip(
    setTooltip: (t: { x: number; y: number; content: React.ReactNode } | null) => void
) {
    setTooltip(null);
}