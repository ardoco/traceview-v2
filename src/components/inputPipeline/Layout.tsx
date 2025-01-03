'use client'
import { ReactNode } from "react"

interface LayoutProps {
    children: ReactNode
}

export default function Layout({ children }: LayoutProps) {

    return (
        <section className='py-16 px-4 flex justify-center items-center mt-[24vh]'>
            {children}
        </section>
    )
}