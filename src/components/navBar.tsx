import Link from "next/link";
import Image from 'next/image'

// This components describes the navigation bar at the top of the page.

function Navbar() {
    return (
        <nav className="py-1 bg-white h-1/12">
            <Link href="/">
                <Image src="/ardoco-logo.png" width={45} height={45} alt="logo" className="p-1" />
            </Link>

        </nav>
    )
}

export default Navbar