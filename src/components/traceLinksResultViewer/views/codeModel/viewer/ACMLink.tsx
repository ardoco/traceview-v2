import {DefaultLinkObject, HierarchyLink, Link} from "d3";
import {CodeModelUnit} from "@/components/traceLinksResultViewer/views/codeModel/dataModel/ACMDataModel";
import {useHighlightContext} from "@/components/traceLinksResultViewer/views/HighlightContextType";

type ACMLinkProps = {
    diagonal: Link<any, DefaultLinkObject, [number, number]>;
    link: HierarchyLink<CodeModelUnit>;
    isHighlighted: boolean;
}

export default function ACMLink({diagonal, link, isHighlighted}: ACMLinkProps) {

    return (
        <path
            d={diagonal(link as any)!}
            fill="none"
            stroke={isHighlighted ? "#fde047" : "#D3D3D3"}
            strokeWidth={isHighlighted ? 4 : 1.5}
        />
    );

}