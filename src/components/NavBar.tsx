'use client';

import Link from "next/link";
import {useState} from "react";
import {Bars3Icon, PencilIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {Dialog, DialogPanel} from "@headlessui/react";
import {useApiAddressContext} from "@/contexts/ApiAddressContext";
import EditApiAddressModal from "@/components/EditApiAddressModal";
import {useNavigation} from "@/contexts/NavigationContext";
import clsx from "clsx";
import { FaGithub, FaRegQuestionCircle } from "react-icons/fa";

// Navigation menu items (icons can be defined per item)
const navigation = [
    {name: 'New Project', href: '/new-project'},
    {name: 'Load Project', href: '/load-project'},
    {name: 'About', href: 'https://ardoco.de/', icon: FaRegQuestionCircle},
    {name: 'GitHub', href: 'https://github.com/ardoco', icon: FaGithub},
];

interface ArdocoLogoProps {
    onClick: (href: string, event: any) => void;
}

export function ArdocoLogo({onClick}: ArdocoLogoProps) {
    const href = "/";

    const handleClick = (event: any) => {
        onClick(href, event);
    }

    return (
        <Link
            href={href}
            className={`-ml-3 p-1.5 w-24 h-24 bg-radial-[at_50%_50%] from-[#FFF4] to-75% flex items-center justify-center`}
            onClick={handleClick}
        >
            <img
                alt="ARDoCo logo"
                src="/ardoco-logo.png"
                className={clsx(`w-auto h-3/4`)}
            />
        </Link>
    );
}

export default function NavBar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {apiAddress} = useApiAddressContext();
    const {handleNavigation} = useNavigation();

    const onClickNavigation = (href: string, event: any) => {
        event.preventDefault();
        handleNavigation(href);
    }

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-50 bg-transparent">
                <nav aria-label="Global" className="flex items-center justify-between p-3 lg:px-8 h-24">
                    {/* Logo */}
                    <div className="flex lg:flex-1">
                        <ArdocoLogo onClick={onClickNavigation}/>
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
                    <div className="hidden lg:flex lg:gap-x-6">

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

                        {navigation.map((item) => {
                            const Icon = (item as any).icon;
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    onClick={(e) => onClickNavigation(item.href, e)}
                                    className="py-2 text-sm font-semibold text-white hover:opacity-90"
                                >
                                    {Icon ? (
                                        <>
                                            <Icon className="h-5 w-5" aria-hidden="true" />
                                            <span className="sr-only">{item.name}</span>
                                        </>
                                    ) : (
                                        item.name
                                    )}
                                </a>
                            );
                        })}
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
                            <ArdocoLogo onClick={onClickNavigation}/>
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
                                {navigation.map((item) => {
                                    const Icon = (item as any).icon;
                                    return (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-900 hover:bg-gray-50"
                                        >
                                            {Icon && <Icon className="h-5 w-5 inline-block mr-2" aria-hidden="true" />}
                                            <span>{item.name}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </DialogPanel>
                </Dialog>
            </header>
            <EditApiAddressModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
        </>
    );
}
