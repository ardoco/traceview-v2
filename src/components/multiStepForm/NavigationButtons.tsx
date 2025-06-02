'use client';

import Link from "next/link";

export interface NavigationButtonsProps {
    link_back?: string;
    link_to_next?: string;
    finish?: boolean; // determines whether clicking next shows "Calculate TraceLinks"
}

export default function NavigationButtons({ link_back, link_to_next, finish }: NavigationButtonsProps) {
    return (
        <div className="flex justify-between items-center mt-8 w-full">
            {/* Back button */}
            {link_back && (
                <Link href={link_back}>
                    <button className="px-6 py-2 border-2 border-jordy_blue-300 rounded-lg text-lg text-transparent bg-clip-text bg-jordy_blue-300 hover:bg-jordy_blue-200">
                        Back
                    </button>
                </Link>
            )}

            {/* Next button */}
            {link_to_next && (
                <Link href={link_to_next}>
                    <button className="px-6 py-2 rounded-lg text-lg text-white bg-jordy_blue-300 hover:bg-jordy_blue-200">
                        {finish ? "Calculate TraceLinks" : "Next"}
                    </button>
                </Link>
            )}
        </div>
    );
}