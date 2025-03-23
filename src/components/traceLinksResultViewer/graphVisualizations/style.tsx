export interface StyleableUIElement {
    /**
     * Sets the style of the element to the given style
     * @param style The style to set
     */
    setStyle(style: Style): void;
}

export interface StyleableButtonElement {
    /**
     * Sets the style of the button to the given style
     * @param style The style to set
     */
    setStyle(style: ButtonStyle): void;
}

/**
 * Convenience interface to be able to only specify the properties of a button style that can not be derived from the style object when. Intended to be used when creating a new style object.
 */
interface ProtoButtonStyle {
    backgroundColor: string;
    hoverBackgroundColor: string;
    downBackgroundColor: string;
}

/**
 * This class represents a set of colors defining the appearance of a button
 */
export class ButtonStyle {
    backgroundColor: string;
    hoverBackgroundColor: string;
    downBackgroundColor: string;
    textColor: string;
    borderColor: string;

    constructor(
        backgroundColor: string,
        hoverBackgroundColor: string,
        downBackgroundColor: string,
        textColor: string,
        borderColor: string,
    ) {
        this.backgroundColor = backgroundColor;
        this.hoverBackgroundColor = hoverBackgroundColor;
        this.downBackgroundColor = downBackgroundColor;
        this.textColor = textColor;
        this.borderColor = borderColor;
    }

    /**
     * Gets the color to be used for the button's background
     * @returns The color
     */
    public getButtonColor(): string {
        return this.backgroundColor;
    }

    /**
     * Gets the color the button should change to when the mouse hovers over it
     * @returns The color
     */
    public getButtonHoverColor(): string {
        return this.hoverBackgroundColor;
    }

    /**
     * Gets the color the button should change to when the mouse is pressed on it
     * @returns The color
     */
    public getButtonDownColor(): string {
        return this.downBackgroundColor;
    }

    /**
     * Gets the color to be used for the button's text or symbol
     * @returns The color
     */
    public getTextColor() {
        return this.textColor;
    }

    /**
     * Geth the color to be used for the button's border
     * @returns The color
     */
    public getBorderColor() {
        return this.borderColor;
    }
}

/**
 * This class represents a set of colors defining the appearance of the application
 */
export class Style {
    public static readonly ARDOCO = new Style(
        "var(--ardoco-color)",
        "var(--ardoco-selectable-text-color)",
        "var(--ardoco-not-selectable-text-color)",
        "var(--ardoco-background-color)",
        "var(--ardoco-paper-color)",
        "var(--ardoco-header-color)",
        "var(--ardoco-border-color)",
        {
            backgroundColor: "var(--ardoco-button-background-color)",
            hoverBackgroundColor: "var(--ardoco-button-hover-background-color)",
            downBackgroundColor: "var(--ardoco-button-down-background-color)",
        },
    );

    protected ardocoColor: string;
    protected selectableText: string;
    protected notSelectableText: string;
    protected background: string;
    protected paper: string;
    protected headerColor: string;
    protected borderColor: string;
    protected buttonStyle: ButtonStyle;

    protected constructor(
        ardocoColor: string,
        selectableText: string,
        notSelectableText: string,
        background: string,
        paper: string,
        headerColor: string,
        borderColor: string,
        buttonStyle: ProtoButtonStyle,
    ) {
        this.ardocoColor = ardocoColor;
        this.selectableText = selectableText;
        this.notSelectableText = notSelectableText;
        this.background = background;
        this.paper = paper;
        this.headerColor = headerColor;
        this.borderColor = borderColor;
        this.buttonStyle = new ButtonStyle(
            buttonStyle.backgroundColor,
            buttonStyle.hoverBackgroundColor,
            buttonStyle.downBackgroundColor,
            this.selectableText,
            this.borderColor,
        );
    }

    public getArdocoColor(): string {
        return this.ardocoColor;
    }

    /**
     * Gets the {@link ButtonStyle} associated with this style
     * @returns The button style
     */
    public getButtonStyle(): ButtonStyle {
        return this.buttonStyle;
    }

    /**
     * Gets the color to be used by applications to indicate that an element is selectable.
     * @returns The color
     */
    public getSelectableTextColor(): string {
        return this.selectableText;
    }

    /**
     * Gets the color to be used by applications to indicate that an element is not selectable
     * @returns The color
     */
    public getNotSelectableTextColor(): string {
        return this.notSelectableText;
    }

    /**
     * Gets the color to be used as a background for the entire application
     * @returns The color
     */
    public getBackgroundColor(): string {
        return this.background;
    }

    /**
     * Gets the color to be used for HTMLElements displaying visualizations or text
     */
    public getPaperColor(): string {
        return this.paper;
    }

    public getHoverColor(): string {
        return this.getButtonStyle().getButtonColor();
    }

    /**
     * Get the color to use for any border
     * @returns The color
     */
    public getBorderColor(): string {
        return this.borderColor;
    }

    /**
     * Get the color used to faded borders, i.e. border seperating entries in a dropdown menu
     * @returns The color
     */
    public getFadedBorderColor(): string {
        return this.notSelectableText;
    }

    /**
     * Gets the color to be used as a background for headers
     * @returns The color
     */
    public getHeaderColor(): string {
        return this.headerColor;
    }

    /**
     * Gets the color to be used to outline colored text for better readability
     * @returns The color
     */
    public getHighlightedTextOutlineColor(): string {
        return "black";
    }

    /**Applies the style to a container, i.e. a  HTMLElement that contains both a header and a panel.
     *
     * @param container The container
     */
    public applyToContainer(container: HTMLElement) {
        container.style.backgroundColor = this.getPaperColor();
        container.style.border = "1px solid " + this.getBorderColor();
    }

    /**
     * Applies the style to a panel, i.e. a HTML element containing a visualization, text or an image
     * @param panel The panel
     */
    public applyToPanel(panel: HTMLElement) {
        panel.style.color = this.getSelectableTextColor();
        panel.style.backgroundColor = this.getPaperColor();
    }

    /**
     * Applies the style to a header
     * @param header The header
     */
    public applyToHeader(header: HTMLElement) {
        header.style.borderBottom = "1px solid " + this.getBorderColor();
        header.style.borderTop = "1px solid " + this.getBorderColor();
        header.style.backgroundColor = this.getHeaderColor();
        header.style.color = this.getSelectableTextColor();
    }

    /**
     * Applies the style to a button
     * @param button The button
     */
    public applyToButton(button: HTMLElement) {
        button.style.color = this.getSelectableTextColor();
        button.style.backgroundColor = this.getButtonStyle().getButtonColor();
        button.style.border = "1px solid " + this.getBorderColor();
    }
}
