// this class basically wraps any page component in the application.
// This means that all things that should always be displayed like the nav bar or the footer, can go in here. So it doesn't need to be
// specified in every page.

import type {Metadata} from "next";
import {IBM_Plex_Mono, IBM_Plex_Sans} from 'next/font/google' // same fonts as ardoco.de
import './globals.css' // load the globals.css for every page we have
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import {ApiAddressProvider} from "@/contexts/ApiAddressContext";
import {NavigationProvider} from "@/contexts/NavigationContext";

const plexSans = IBM_Plex_Sans({subsets: ['latin'], variable: '--font-ibm-plex-sans'});
const plexMono = IBM_Plex_Mono({subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-ibm-plex-mono'});


export const metadata: Metadata = { // those metadatas are the ones that are used for every page in the application. They can be overridden on a page by page basis.
    title: 'ARDoCo TraceView',
    description: 'Recover and explore trace links between architecture documentation, models and code, and detect inconsistencies.',
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
        <html lang="en" className={`h-full relative ${plexSans.variable} ${plexMono.variable}`}>
        <body className="h-full font-sans">
        <ApiAddressProvider>
            <NavigationProvider>
                <NavBar/>
                <div className="fixed top-16 bottom-0 left-0 w-full flex flex-col">
                    <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
                    <Footer/>
                </div>
            </NavigationProvider>
        </ApiAddressProvider>

        </body>
        </html>
    )
}
