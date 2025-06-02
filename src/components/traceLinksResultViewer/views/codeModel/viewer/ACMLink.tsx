import {HierarchyLink, HierarchyPointLink, Link as D3Link} from "d3";
import { ACMLayoutNode } from "@/components/traceLinksResultViewer/views/codeModel/viewer/ACMViewer";
import {CodeModelUnit} from "@/components/traceLinksResultViewer/views/codeModel/dataModel/ACMDataModel";

type ACMLinkProps = {
    diagonal: (link: HierarchyPointLink<ACMLayoutNode>) => string | null;
    link: HierarchyPointLink<ACMLayoutNode>;
    isHighlighted: boolean;
};

export default function ACMLink({ diagonal, link, isHighlighted }: ACMLinkProps) {
    return (
        <path
            d={diagonal(link as any)!}
            fill="none"
            stroke={isHighlighted ? "#fde047" : "#D3D3D3"}
            strokeWidth={isHighlighted ? 4 : 1.5}
        />
    );
}
