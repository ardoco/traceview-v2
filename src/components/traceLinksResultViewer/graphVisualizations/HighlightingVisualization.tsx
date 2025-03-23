import { Buttoned, ConceptualUIButton } from "./abstractUI";
import { Style, StyleableUIElement } from "./style";

/**
 * A listener that can be notified of changes in the highlighting state of a {@link HighlightingSubject}.
 */
export interface HighlightingListener {
    shouldBeHighlighted(id: string): void;
    shouldBeUnhighlighted(id: string): void;
    shouldClose(): void;
}

/**
 * A subject that can be observed by {@link HighlightingListener}s. It provides methods to add and remove listeners and to notify them of changes.
 */
export interface HighlightingSubject {
    addHighlightingListener(listener: HighlightingListener): void;
    highlight(id: string, color: string): void;
    unhighlight(id: string): void;
}

export abstract class HighlightingVisualization
    implements HighlightingSubject, Buttoned, StyleableUIElement
{
    private highlightingListeners: HighlightingListener[];
    private currentlyHighlighted: Map<string, boolean>;
    private readonly title: string;
    protected readonly id: number;

    protected style: Style;

    /**
     *
     * @param title A human-readable title of the visualization
     * @param style A {@link Style} object that defines the visualization's appearance
     */
    constructor(title: string, style: Style) {
        this.highlightingListeners = [];
        this.title = title;
        this.currentlyHighlighted = new Map<string, boolean>();
        this.style = style;
        this.id = Date.now();
    }

    protected abstract highlightElement(id: string, color: string): void;
    protected abstract unhighlightElement(id: string): void;
    protected abstract setElementsHighlightable(ids: string[]): void;
    protected abstract setElementsNotHighlightable(ids: string[]): void;

    public abstract getName(id: string): string;

    /**
     * Get the unique identifier of this visualization. A visualization's identifier is unique within the application and based on its creation time.
     * @returns The unique identifier of this visualization
     */
    public getID(): number {
        return this.id;
    }

    /**
     * Gets a human-readable title of this visualization.
     * @returns
     */
    public getTitle(): string {
        return this.title;
    }

    /**
     * Gets the {@link ConceptualUIButton}s this visualization provides.
     * @returns The {@link ConceptualUIButton}s this visualization provides
     */
    getButtons(): ConceptualUIButton[] {
        return [
            new ConceptualUIButton(
                ConceptualUIButton.SYMBOL_ERASE,
                "Clear Highlighting",
                () => {
                    this.unhighlightAll();
                    return true;
                },
            ),
            new ConceptualUIButton(ConceptualUIButton.SYMBOL_CLOSE, "Close", () => {
                this.shouldClose();
                return true;
            }),
        ];
    }

    /**
     * Notifies all listeners that the visualization should be closed.
     */
    shouldClose(): void {
        for (let listener of this.highlightingListeners) {
            listener.shouldClose();
        }
    }

    /**
     * Unhighlights all currently highlighted elements.
     */
    unhighlightAll(): void {
        for (let id of this.currentlyHighlighted.keys()) {
            if (this.currentlyHighlighted.get(id)) {
                this.toggleHighlight(id);
            }
        }
    }

    /**
     * Highlights the artifact with the specified identifier in the visualization using the specified color.
     * @param id The target artifact's identifier
     * @param color The color to use for highlighting
     */
    public highlight(id: string, color: string): void {
        this.highlightElement(id, color);
        this.currentlyHighlighted.set(id, true);
    }

    /**
     * Unhighlights the artifact with the specified identifier in the visualization.
     * @param id The target artifact's identifier
     */
    public unhighlight(id: string): void {
        this.unhighlightElement(id);
        this.currentlyHighlighted.set(id, false);
    }

    /**
     * Adds a listener to this {@link HighlightingSubject}
     * @param listener The listener to be added
     */
    public addHighlightingListener(listener: HighlightingListener): void {
        this.highlightingListeners.push(listener);
    }

    /**
     * Notifies all listeners that the artifact with the specified identifier should have its highlighting toggled.
     * @param id The target artifact's identifier
     */
    protected toggleHighlight(id: string): void {
        if (this.currentlyHighlighted.get(id)) {
            for (let listener of this.highlightingListeners) {
                listener.shouldBeUnhighlighted(id);
            }
        } else {
            for (let listener of this.highlightingListeners) {
                listener.shouldBeHighlighted(id);
            }
        }
    }

    /**
     * Returns whether the artifact with the specified identifier is currently highlightable.
     * @param id The target artifact's identifier
     * @returns Whether the artifact with the specified identifier is currently highlightable
     */
    protected idIsHighlightable(id: string): boolean {
        return this.currentlyHighlighted.has(id);
    }

    /**
     * Changes the artifacts corresponding to a list of identifiers to be highlightable
     * @param ids The identifiers of the artifacts to be made highlightable
     */
    public setHighlightable(ids: string[]): void {
        const idsToChange = ids.filter((id) => !this.idIsHighlightable(id));
        console.log(this.constructor.name + " received " + ids.length);
        console.log(idsToChange);
        this.setElementsHighlightable(idsToChange);
        for (let id of idsToChange) {
            this.currentlyHighlighted.set(id, false);
        }
    }

    /**
     * Clears all highlightability settings of this visualization. Intended to be used for resetting the visualization's state.
     */
    public clearHighlightability(): void {
        this.setElementsNotHighlightable(
            Array.from(this.currentlyHighlighted.keys()),
        );
        this.currentlyHighlighted.clear();
    }

    /**
     * Inverse of {@link HighlightingVisualization.setHighlightable}. Changes the artifacts corresponding to a list of identifiers to be unhighlightable
     * @param ids
     */
    public setUnhighlightable(ids: string[]): void {
        const idsToChange = ids.filter((id) => this.idIsHighlightable(id));
        this.setElementsNotHighlightable(idsToChange);
        for (let id of idsToChange) {
            this.currentlyHighlighted.delete(id);
        }
    }

    /**
     * Sets the style of this visualization
     * @param style The new style
     */
    abstract setStyle(style: Style): void;
}
