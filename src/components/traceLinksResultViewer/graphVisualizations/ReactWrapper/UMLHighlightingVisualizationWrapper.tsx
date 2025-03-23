// 'use client';
//
// import React, { useEffect, useRef } from 'react';
// import {UMLModel} from "@/components/traceLinksResultViewer/util/dataModelsInputFiles/UMLDataModel";
// import {Style} from "@/components/traceLinksResultViewer/graphVisualizations/style";
// import {
//     UMLHighlightingVisualization
// } from "@/components/traceLinksResultViewer/graphVisualizations/UMLHighlightingVisualization";
//
// interface UMLGraphProps {
//     modelData: any;
// }
//
// export default function UMLGraph({ modelData }: UMLGraphProps) {
//     const containerRef = useRef<HTMLDivElement>(null);
//
//     useEffect(() => {
//         if (!containerRef.current || !modelData) return;
//
//         // Convert `modelData` into an instance of `UMLModel`
//         const umlModel = new UMLModel(modelData);
//
//         // Apply a style
//         // const style = new Style();
//
//         // Create the visualization
//         new UMLHighlightingVisualization(containerRef.current, umlModel, "UML Graph", style);
//     }, [modelData]); // Re-run when `modelData` changes
//
//     return <div ref={containerRef} className="w-full h-[500px] border border-gray-300" />;
// }
