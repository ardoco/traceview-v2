type UMLRelationshipViewProps = {
    from: { x: number; y: number };
    to: { x: number; y: number };
    type: string;
}

export default function UMLRelationshipView({from, to, type}: UMLRelationshipViewProps) {
    const strokeStyle = type === 'uml:Usage' ? 'stroke-dashed' : 'stroke-solid';
    return (
        <svg className={`absolute top-0 left-0 w-full h-full pointer-events-none ${strokeStyle}`}>
            <line
                x1={from?.x ?? 0}
                y1={from?.y ?? 0}
                x2={to?.x ?? 0}
                y2={to?.y ?? 0}
                stroke="black"
                strokeWidth="2"
                strokeDasharray={type === 'uml:Usage' ? '6,4' : '0'}
            />
        </svg>
    );

}