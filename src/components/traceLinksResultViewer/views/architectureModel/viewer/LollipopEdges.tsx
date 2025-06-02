export interface LollipopProps {
    x: number;
    y: number;
    facingVector: { x: number; y: number };
    radius?: number;
    lineLength?: number;
    strokeColor?: string;
    strokeWidth?: number;
}

export function ProvidedLollipop({x, y, facingVector, lineLength = 6, radius = 6, strokeColor="black", strokeWidth=1.5}: LollipopProps) {
    const fillColor = "white";

    const norm = Math.hypot(facingVector.x, facingVector.y);
    const dx = (facingVector.x / norm) * lineLength;
    const dy = (facingVector.y / norm) * lineLength;

    const cx = x + dx + (facingVector.x / norm) * radius;
    const cy = y + dy + (facingVector.y / norm) * radius;

    return (
        <g>
            <line
                x1={x}
                y1={y}
                x2={x + dx}
                y2={y + dy}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
            />
            <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill={fillColor}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
            />
        </g>
    );
}

export function RequiredLollipop({x, y, facingVector, lineLength = 6, radius = 6, strokeColor="black", strokeWidth=1.5}: LollipopProps) {
    const norm = Math.hypot(facingVector.x, facingVector.y);
    const ux = facingVector.x / norm;
    const uy = facingVector.y / norm;

    const dx = ux * lineLength;
    const dy = uy * lineLength;

    const arcCenterX = x + dx + ux * radius;
    const arcCenterY = y + dy + uy * radius;

    const angle = Math.atan2(uy, ux);
    const angleDeg = (angle * 180) / Math.PI;

    return (
        <g>
            {/* Line */}
            <line
                x1={x}
                y1={y}
                x2={x + dx}
                y2={y + dy}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
            />

            {/* Half-circle Path (open away from line) */}
            <path
                d={`
                    M ${arcCenterX - radius}, ${arcCenterY}
                    A ${radius} ${radius} 0 0 0 ${arcCenterX + radius}, ${arcCenterY}
                `}
                transform={`rotate(${angleDeg + 90}, ${arcCenterX}, ${arcCenterY})`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
            />
        </g>
    );
}
