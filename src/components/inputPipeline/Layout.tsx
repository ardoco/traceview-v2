'use client'
import { ReactNode } from "react"

interface LayoutProps {
    children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {

    console.log("layout Component rendered");

    return (
        <section className='py-16 px-4 flex justify-center items-center mt-[24vh]'>
            {children}
        </section>
    )
}