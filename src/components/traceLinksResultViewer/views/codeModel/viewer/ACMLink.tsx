import {HierarchyLink, HierarchyPointLink} from "d3";
import {ACMLayoutNode} from "@/components/traceLinksResultViewer/views/codeModel/viewer/ACMViewer";

type ACMLinkProps = {
    diagonal: (link: HierarchyLink<ACMLayoutNode>) => string | null;
    link: HierarchyPointLink<ACMLayoutNode>;
    isHighlighted: boolean;
};

export default function ACMLink({diagonal, link, isHighlighted}: ACMLinkProps) {
    return (
        <path
            d={diagonal(link)!}
            fill="none"
            stroke={isHighlighted ? "var(--color-highlight-tracelink)" : "#D3D3D3"}
            strokeWidth={isHighlighted ? 4 : 1.5}
        />
    );
}
