'use client';

import Link from "next/link";
import {useState} from "react";
import {Bars3Icon, PencilIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {Dialog, DialogPanel} from "@headlessui/react";
import {useApiAddressContext} from "@/contexts/ApiAddressContext";
import EditApiAddressModal from "@/components/EditApiAddressModal";
import {useNavigation} from "@/contexts/NavigationContext";

// Navigation menu items
const navigation = [
    {name: 'New Project', href: '/new-project'},
    {name: 'Load Project', href: '/load-project'},
    {name: 'About', href: 'https://ardoco.de/'},
    {name: 'GitHub', href: 'https://github.com/ArDoCo'},
];

// Component for the ArDoCo logo
interface ArDoCoLogoProps {
    /** Corresponds to keys in sizeClassMap (e.g., 8, 10, 12) */
    size: number;
    onClick: (href:string, event: any) => void;
}

// Mapping for image sizes to ensure Tailwind JIT picks them up
const imageSizeMap: { [key: number]: string } = {
    8: "h-8 w-auto",
    9: "h-9 w-auto",
    10: "h-10 w-auto",
    11: "h-11 w-auto",
    12: "h-12 w-auto",
    13: "h-13 w-auto",
    14: "h-14 w-auto",
    15: "h-15 w-auto",
    16: "h-16 w-auto",
};

export function ArDoCoLogo({size, onClick}: ArDoCoLogoProps) {
    const imageClasses = imageSizeMap[size] || imageSizeMap[10];

    return (
        <a
            href="/"
            className={`-ml-3 p-1.5 w-24 h-24 bg-radial-[at_50%_50%] from-[#FFF4] to-75% flex items-center justify-center`}
            onClick={(event) => onClick("/", event)}
        >
            <span className="sr-only">ArDoCo Logo</span>
            <img
                alt="ArDoCo Logo"
                src="/ardoco-logo.png" // Assumes ardoco-logo.png is in the public folder
                className={imageClasses}
            />
        </a>
    );
}

export default function NavBar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {apiAddress} = useApiAddressContext();
    const { handleNavigation } = useNavigation();

    const onClickNavigation = (href: string, event:any) => {
        event.preventDefault();
        handleNavigation(href);
    }

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-50 bg-transparent">
                <nav aria-label="Global" className="flex items-center justify-between p-3 lg:px-8 h-24">
                    {/* Logo */}
                    <div className="flex lg:flex-1">
                        <ArDoCoLogo size={16} onClick={onClickNavigation}/>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex lg:hidden">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
                        >
                            <span className="sr-only">Open main menu</span>
                            <Bars3Icon aria-hidden="true" className="h-6 w-6"/>
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex lg:gap-x-12">

                        {/* Styled API Address Display */}
                        <div
                            className="flex items-center gap-x-2 rounded-md px-3 py-1.5 ring-1 ring-white/10 hover:ring-white/20">
                            <span className="text-sm text-white" title={apiAddress ?? "loading"}>
                                Connected API: <span className="font-semibold">{apiAddress ?? "loading"}</span>
                            </span>
                            <button onClick={() => setIsModalOpen(true)} className="text-white/80 hover:text-white">
                                <span className="sr-only">Edit API Address</span>
                                <PencilIcon className="h-4 w-4"/>
                            </button>
                        </div>

                        {navigation.map((item) => (
                            <a key={item.name}
                               href={item.href}
                               onClick={(e) => onClickNavigation(item.href, e)}
                               className="py-2 text-sm font-semibold text-white">
                                {item.name}
                            </a>
                        ))}
                    </div>
                </nav>

                {/* Mobile Navigation Dialog */}
                <Dialog
                    open={mobileMenuOpen}
                    onClose={setMobileMenuOpen}
                    className="lg:hidden"
                >
                    {/* Overlay */}
                    <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50"/>

                    {/* Mobile Menu Panel */}
                    <DialogPanel
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white px-6 py-6 sm:ring-1 sm:ring-gray-900/10">
                        <div className="flex items-center justify-between">
                            <ArDoCoLogo size={10} onClick={onClickNavigation}/>
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(false)}
                                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                            >
                                <span className="sr-only">Close menu</span>
                                <XMarkIcon aria-hidden="true" className="h-6 w-6"/>
                            </button>
                        </div>
                        <div className="mt-6">
                            <div className="space-y-2">
                                {navigation.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
                                    >
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </DialogPanel>
                </Dialog>
            </header>
            <EditApiAddressModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
        </>
    );
}
