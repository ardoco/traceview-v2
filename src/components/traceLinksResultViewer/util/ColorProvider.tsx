export class ColorProvider {
    // Define a fixed set of 30 colors
    private readonly colors: string[] = [
        "#FF5733",
        "#33FF57",
        "#3357FF",
        "#F333FF",
        "#FF33A1",
        "#FFD700",
        "#4CAF50",
        "#FF4500",
        "#8A2BE2",
        "#00FFFF",
        "#800080",
        "#A52A2A",
        "#7FFF00",
        "#D2691E",
        "#6495ED",
        "#FF6347",
        "#00FA9A",
        "#D3D3D3",
        "#FF1493",
        "#FF69B4",
        "#2E8B57",
        "#8B0000",
        "#B22222",
        "#FF8C00",
        "#FFD700",
        "#00BFFF",
        "#4169E1",
        "#7CFC00",
        "#ADFF2F",
        "#FAFAD2"
    ];

    // To track reserved colors by id
    private usedColors = new Map<string, string>();

    constructor() {
        // Optionally set a fixed seed if you'd like a deterministic random order
    }


    reserveColor(id: string): string {
        if (this.usedColors.has(id)) {
            return this.usedColors.get(id)!;
        }
        let availableColor = this.getNextAvailableColor();
        this.usedColors.set(id, availableColor);

        return availableColor;
    }

    // Function to release the color when no longer needed
    releaseColor(id: string): void {
        if (this.usedColors.has(id)) {
            this.usedColors.delete(id);
        }
    }

    // Get the next available color in the cycle (or random choice)
    private getNextAvailableColor(): string {
        for (let color of this.colors) {
            if (!this.isColorUsed(color)) {
                return color;
            }
        }
        return this.colors[0];
    }

    // Check if a color is already used
    private isColorUsed(color: string): boolean {
        return Array.from(this.usedColors.values()).includes(color);
    }
}
