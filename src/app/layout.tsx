// this class basically wraps any page component in the application.
// This means that all things that should always be displayed like the nav bar or the footer, can go in here. So it doesn't need to be
// specified in every page.

import type {Metadata} from "next";
import {Inter} from 'next/font/google' // use one font for every page.
import './globals.css' // load the globals.css for every page we have
import Navbar from "@/components/navBar";

const inter = Inter({subsets: ['latin']});


export const metadata: Metadata = { // those metadatas are the ones that are used for every page in the application. They can be overridden on a page by page basis.
    title: 'traceview2 demo project',
    description: 'This is a demo project',
}

export default function RootLayout({
                                       children, // children component refers to the page that is currently being rendered in the browser.
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Navbar></Navbar>
                {children}
            </body>
        </html>
    )
}
