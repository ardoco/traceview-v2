
import { CodeModelTreeVisualization } from "./CodeModelTreeVisualization";
import { HighlightingVisualization } from "./HighlightingVisualization";
import { NLHighlightingVisualization } from "./DocumentationHighlightingVisualization";
import { UMLHighlightingVisualization } from "./UMLHighlightingVisualization";
import {parseNLTXT} from "@/components/traceLinksResultViewer/util/parser/DocumentationParser";
import {parseUML} from "@/components/traceLinksResultViewer/util/parser/UMLParser";
import {parseCodeFromACM} from "@/components/traceLinksResultViewer/util/parser/ACMparser";
import {Style} from "@/components/traceLinksResultViewer/graphVisualizations/style";

/**
 * This file has been taken from the TraceView project.
 * The original file can be found at: https://github.com/ArDoCo/TraceView/blob/main/src/artifactVisualizations/visFactory.ts
 */

export enum VisualizationType {
    NL,
    UML,
    CODE,
}

/**
 * This factory handles the instantiation of visualizations based on the input data and the desired visualization type.
 * An object of this class if passed to the application on creation and this object will define which visualization types are supported.
 */
export class VisualizationFactory {
    protected static readonly NLVIS_TITLE = "Architecture Documentation";
    protected static readonly UMLVIS_TITLE = "UML Component Diagram";
    protected static readonly CODEVIS_TITLE = "Code Model";

    /**
     * Instantiates a new VisualizationFactory object
     */
    constructor() {}

    /**
     * Returns an array of all visualization types known to this factory. These make up the valid inputs and expected outputs of the factory's other methods.
     * @returns An array of all visualization types
     */
    public getAllVisualizationTypes(): VisualizationType[] {
        return [
            VisualizationType.NL,
            VisualizationType.UML,
            VisualizationType.CODE,
        ];
    }

    /**
     * This function is used to initialize a new visualization of the specified type. It will return a generator function that returns a new visualization of the specified type by parsing the data and attaching it to the specified viewport.
     * @param visualizationType The desired visualization type
     * @param data The data to be parsed into artifacts for the visualization
     * @param style A style object to the new visualization's appearance
     * @returns A generator function that will attach a visualization based on the input data to the specified viewport
     */
    public fabricateVisualization(
        visualizationType: VisualizationType,
        data: string[],
        style: Style,
    ): (vp: HTMLElement) => HighlightingVisualization {
        if (visualizationType == VisualizationType.NL) {
            const sentences = parseNLTXT(data[0]);
            return (vp: HTMLElement) =>
                new NLHighlightingVisualization(
                    vp,
                    sentences,
                    VisualizationFactory.NLVIS_TITLE,
                    style,
                );
        } else if (visualizationType == VisualizationType.UML) {
            const uml = parseUML(data[0]);
            return (vp: HTMLElement) =>
                new UMLHighlightingVisualization(
                    vp,
                    uml,
                    VisualizationFactory.UMLVIS_TITLE,
                    style,
                );
        } else if (visualizationType == VisualizationType.CODE) {
            const codeModel = parseCodeFromACM(data[0]);
            return (vp: HTMLElement) =>
                new CodeModelTreeVisualization(
                    vp,
                    codeModel,
                    VisualizationFactory.CODEVIS_TITLE,
                    style,
                );
        }
        throw new Error("Unknown visualization type: " + visualizationType);
    }

    /**
     * Returns the number of files necessary to initialize a visualization of the specified type
     * @param visualizationType The visualization type
     * @returns The number of files required
     */
    public getExpectedFileCount(visualizationType: VisualizationType): number {
        if (
            [
                VisualizationType.NL,
                VisualizationType.UML,
                VisualizationType.CODE,
            ].includes(visualizationType)
        ) {
            return 1;
        } else {
            throw new Error("Unknown visualization type: " + visualizationType);
        }
    }

    /**
     * Maps a visualization type index to its corresponding name
     * @param typeIndex The visualization type index
     * @returns The corresponding name
     */
    public getTypeName(typeIndex: number): string {
        if (typeIndex == VisualizationType.NL) {
            return VisualizationFactory.NLVIS_TITLE;
        } else if (typeIndex == VisualizationType.UML) {
            return VisualizationFactory.UMLVIS_TITLE;
        } else if (typeIndex == VisualizationType.CODE) {
            return VisualizationFactory.CODEVIS_TITLE;
        }
        throw new Error("Unknown visualization type: " + typeIndex);
    }

    /**
     * Maps a visualization type name to its corresponding enum value
     * @param name The visualization type name
     * @returns The corresponding enum value
     */
    public getType(name: string): VisualizationType {
        if (name == VisualizationFactory.NLVIS_TITLE) {
            return VisualizationType.NL;
        } else if (name == VisualizationFactory.UMLVIS_TITLE) {
            return VisualizationType.UML;
        } else if (name == VisualizationFactory.CODEVIS_TITLE) {
            return VisualizationType.CODE;
        }
        throw new Error("Unknown visualization type: " + name);
    }
}
