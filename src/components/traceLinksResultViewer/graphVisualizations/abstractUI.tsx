export interface Buttoned {
    /**
     * Gets the {@link ConceptualUIButton}s this object provides.
     */
    getButtons(): ConceptualUIButton[];
}

/**
 * A representation of a button without any information or assumptions about its appearance.
 */
export class ConceptualUIButton {
    public static readonly SYMBOL_REFRESH = "⟲";
    public static readonly SYMBOL_ERASE = "⌫";
    public static readonly SYMBOL_CLOSE = "✖";

    public readonly label: string;
    public readonly onClick: () => boolean;
    public readonly isToggle: boolean;
    public readonly startsToggled: boolean;

    /**
     * Instantiates a new ConceptualUIButton object
     * @param label The button's label
     * @param tooltip A tooltip to be displayed when hovering over the button
     * @param onClick The action to be performed when the button is clicked
     * @param isToggle Whether the button is a toggle button
     * @param startsToggled Whether the button starts in a toggled state, only taken into account if isToggle is true
     */
    constructor(
        label: string,
        tooltip: string,
        onClick: () => boolean,
        isToggle: boolean = false,
        startsToggled: boolean = false,
    ) {
        this.label = label;
        this.onClick = onClick;
        this.isToggle = isToggle;
        this.startsToggled = startsToggled;
    }
}