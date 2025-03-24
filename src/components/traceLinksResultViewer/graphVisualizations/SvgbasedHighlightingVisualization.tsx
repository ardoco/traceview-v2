import {HighlightingVisualization} from "./HighlightingVisualization";
import * as d3 from "d3";
import {Style} from "@/components/traceLinksResultViewer/graphVisualizations/style";
import {ConceptualUIButton} from "@/components/traceLinksResultViewer/graphVisualizations/abstractUI";

export abstract class SvgbasedHighlightingVisualization extends HighlightingVisualization {
    private readonly zoomMinFactor = 0.1;
    private readonly zoomMaxFactor = 10;

    protected plot: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    protected svgWidth: number;
    protected svgHeight: number;
    private zoomFactor: number = 1;
    private isDragging: boolean = false;
    private dragStart: { x: number; y: number } = {x: 0, y: 0};
    private translation: { x: number; y: number } = {x: 0, y: 0};

    /**
     *
     * @param viewport The viewport the visualization should be attached to
     * @param width The width to use for the underlying SVG element
     * @param height The width to use for  the underlying SVG element
     * @param title A human-readable title of the visualization
     * @param style A {@link Style} object that defines the visualization's appearance
     */
    constructor(
        viewport: HTMLElement,
        width: number,
        height: number,
        title: string,
        style: Style,
    ) {
        super(title, style);
        this.svgWidth = width;
        this.svgHeight = height;
        viewport.style.overflow = "hidden";
        viewport.style.backgroundColor = this.style.getPaperColor();
        this.plot = d3
            .select(viewport)
            .append("svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight);
        viewport.addEventListener("wheel", (event) => {
            event.preventDefault();
            this.zoomFactor = Math.max(
                this.zoomMinFactor,
                Math.min(
                    this.zoomMaxFactor,
                    this.zoomFactor * (1 + -event.deltaY / 1000),
                ),
            );
            this.plot.attr(
                "transform",
                "translate(" +
                this.translation.x +
                "," +
                this.translation.y +
                ") scale(" +
                this.zoomFactor +
                ")",
            );
        });
        window.addEventListener("keypress", (event) => {
            if (event.key === "r") {
                this.resetZoomAndPan();
            }
        });
        viewport.addEventListener("mousedown", (event) => {
            event.preventDefault();
            this.isDragging = true;
            this.dragStart = {x: event.clientX, y: event.clientY};
        });
        window.addEventListener("mouseup", (event) => {
            this.isDragging = false;
        });
        viewport.addEventListener("mouseup", (event) => {
            this.isDragging = false;
        });
        viewport.addEventListener("mousemove", (event) => {
            if (this.isDragging) {
                const dx = event.clientX - this.dragStart.x;
                const dy = event.clientY - this.dragStart.y;
                this.dragStart = {x: event.clientX, y: event.clientY};
                this.translation.x += dx;
                this.translation.y += dy;
                this.plot.attr(
                    "transform",
                    "translate(" +
                    this.translation.x +
                    "," +
                    this.translation.y +
                    ") scale(" +
                    this.zoomFactor +
                    ")",
                );
            }
        });
        // TODO: magic numbers
        this.setTranslation({
            x: -0.25 * this.svgWidth,
            y: -0.25 * this.svgHeight,
        });
        this.setZoomFactor(0.8);
    }

    protected setZoomFactor(zoomFactor: number) {
        this.zoomFactor = zoomFactor;
        this.plot.attr(
            "transform",
            "translate(" +
            this.translation.x +
            "," +
            this.translation.y +
            ") scale(" +
            this.zoomFactor +
            ")",
        );
    }

    protected setTranslation(translation: { x: number; y: number }) {
        this.translation = translation;
        this.plot.attr(
            "transform",
            "translate(" +
            this.translation.x +
            "," +
            this.translation.y +
            ") scale(" +
            this.zoomFactor +
            ")",
        );
    }

    protected resetZoomAndPan() {
        this.zoomFactor = 1;
        this.translation = {x: 0, y: 0};
        this.plot.attr(
            "transform",
            "translate(" +
            this.translation.x +
            "," +
            this.translation.y +
            ") scale(" +
            this.zoomFactor +
            ")",
        );
    }

    public getButtons(): ConceptualUIButton[] {
        const superButtons = super.getButtons();
        return [
            new ConceptualUIButton(
                ConceptualUIButton.SYMBOL_REFRESH,
                "Reset Zoom And Pan",
                () => {
                    this.resetZoomAndPan();
                    return true;
                },
            ),
        ].concat(super.getButtons());
    }
}
