// this class basically wraps any page component in the application.
// This means that all things that should always be displayed like the nav bar or the footer, can go in here. So it doesn't need to be
// specified in every page.

import type {Metadata} from "next";
import {Inter} from 'next/font/google' // use one font for every page.
import './globals.css' // load the globals.css for every page we have
import NavBar from "@/components/NavBar";
import {ApiAddressProvider} from "@/contexts/ApiAddressContext";
import {NavigationProvider} from "@/contexts/NavigationContext";

const inter = Inter({subsets: ['latin']});


export const metadata: Metadata = { // those metadatas are the ones that are used for every page in the application. They can be overridden on a page by page basis.
    title: ' ArDoCo TraceView 2',
    description: 'Is a web application for ARDoCo to visualize tracelinks and inconsistencies between software architecture models and documentation.',
    icons: {
        icon: '/ardoco-logo.png',
    }
}

export default function RootLayout({
                                       children, // children component refers to the page that is currently being rendered in the browser.
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className="h-full dark:bg-cerulean-100 relative">
        <body className={`h-full ${inter.className}`}>
        <ApiAddressProvider>
            <NavigationProvider>
                <NavBar/>
                <div
                    className="fixed top-0 left-0 h-[80vh] -z-1 w-full bg-linear-to-b from-gruen via-blau-700 to-95%"></div>
                <div className="fixed top-24 left0 h-[calc(100%-96px)] w-full overflow-y-auto">
                    <div className="h-full">{children}</div>
                </div>
            </NavigationProvider>
        </ApiAddressProvider>

        </body>
        </html>
    )
}
