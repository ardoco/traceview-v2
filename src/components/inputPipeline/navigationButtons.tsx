'use client'

import Link from "next/link";

export interface NavigationButtonsProps {
    link_back?: string
    link_to_next?: string
    finish?: boolean // determines whether clicking next
}

export default function NavigationButtons({link_back, link_to_next, finish}: NavigationButtonsProps) {
    return (
        <div className=" w-[90%] flex gap-[80%]">
            {/*Back button*/}
            {link_back && (
                <Link href={link_back}>
                    <p className="px-5, py-[2px] border-2 rounded-lg text-[24px] text-transparent bg-clip-text bg-jordy_blue-300 hover:bg-jordy_blue-200">
                        Back
                    </p>
                </Link>
            )}

            {/*Next button*/}
            {link_to_next && (
                <Link href={link_to_next}>
                    <p className="px-3 py-[2px] rounded-lg text-[24px] text-slate-50 bg-jordy_blue-300 hover:bg-jordy_blue-200">
                        {finish? "Calculate TraceLinks" : "Next"}
                    </p>
                </Link>
            )}
        </div>
    )
}