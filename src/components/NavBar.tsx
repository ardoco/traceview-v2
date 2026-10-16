'use client';

import Link from "next/link";
import Image from "next/image";
import type {MouseEvent} from "react";
import {useState} from "react";
import type {IconType} from "react-icons";
import {Bars3Icon, PencilIcon, XMarkIcon} from "@heroicons/react/24/outline";
import {Dialog, DialogPanel} from "@headlessui/react";
import {useApiAddressContext} from "@/contexts/ApiAddressContext";
import EditApiAddressModal from "@/components/EditApiAddressModal";
import {useNavigation} from "@/contexts/NavigationContext";
import { FaGithub, FaRegQuestionCircle } from "react-icons/fa";

// Navigation menu items (icons can be defined per item)
const navigation: { name: string; href: string; icon?: IconType }[] = [
    {name: 'New Project', href: '/new-project'},
    {name: 'Load Project', href: '/load-project'},
    {name: 'About', href: 'https://ardoco.de/', icon: FaRegQuestionCircle},
    {name: 'GitHub', href: 'https://github.com/ardoco', icon: FaGithub},
];

interface ArdocoLogoProps {
    onClick: (href: string, event: MouseEvent<HTMLElement>) => void;
}

export function ArdocoLogo({onClick}: ArdocoLogoProps) {
    const href = "/new-project";

    const handleClick = (event: MouseEvent<HTMLElement>) => {
        onClick(href, event);
    }

    return (
        <Link
            href={href}
            className="inline-flex items-center gap-2 font-mono font-semibold tracking-tight text-ardoco-text hover:text-ardoco-accent"
            onClick={handleClick}
        >
            <Image
                alt=""
                src="/ardoco-logo.png"
                width={480}
                height={600}
                className="h-7 w-auto rounded-md"
            />
            <span>ARDoCo TraceView</span>
        </Link>
    );
}

function ApiAddressDisplay({apiAddress, onEdit}: { apiAddress: string | null, onEdit: () => void }) {
    return (
        <div
            className="flex min-w-0 items-center gap-x-2 rounded-full border border-white/15 bg-ardoco-surface px-3 py-1 hover:border-white/30">
            <span className="min-w-0 truncate text-ardoco-muted" title={apiAddress ?? "loading"}>
                Connected API: <span className="font-semibold text-ardoco-text">{apiAddress ?? "loading"}</span>
            </span>
            <button type="button" onClick={onEdit} className="shrink-0 text-ardoco-muted hover:text-ardoco-accent">
                <span className="sr-only">Edit API Address</span>
                <PencilIcon className="h-4 w-4" aria-hidden="true"/>
            </button>
        </div>
    );
}

export default function NavBar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {apiAddress} = useApiAddressContext();
    const {handleNavigation} = useNavigation();

    const onClickNavigation = (href: string, event: MouseEvent<HTMLElement>) => {
        event.preventDefault();
        handleNavigation(href);
    }

    // same as desktop (including the confirm-navigation check), but also closes the menu
    const onClickMobileNavigation = (href: string, event: MouseEvent<HTMLElement>) => {
        setMobileMenuOpen(false);
        onClickNavigation(href, event);
    }

    return (
        <>
            <header className="fixed inset-x-0 top-0 z-50 border-b border-ardoco-border bg-ardoco-bg">
                <nav aria-label="Global" className="flex items-center justify-between px-4 lg:px-8 h-16">
                    {/* Logo */}
                    <div className="flex lg:flex-1">
                        <ArdocoLogo onClick={onClickNavigation}/>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex lg:hidden">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-ardoco-muted hover:text-ardoco-text"
                        >
                            <span className="sr-only">Open main menu</span>
                            <Bars3Icon aria-hidden="true" className="h-6 w-6"/>
                        </button>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex lg:items-center lg:gap-x-5 font-mono text-[0.8125rem]">

                        <ApiAddressDisplay apiAddress={apiAddress} onEdit={() => setIsModalOpen(true)}/>

                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    onClick={(e) => onClickNavigation(item.href, e)}
                                    className="border-b border-transparent py-1 text-ardoco-muted hover:border-ardoco-accent hover:text-ardoco-accent"
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
                    <div className="fixed inset-0 z-50 bg-gray-800/50"/>

                    {/* Mobile Menu Panel */}
                    <DialogPanel
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-ardoco-bg px-6 py-4 font-mono text-ardoco-text sm:border-l sm:border-ardoco-border">
                        <div className="flex items-center justify-between">
                            <ArdocoLogo onClick={onClickMobileNavigation}/>
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(false)}
                                className="-m-2.5 rounded-md p-2.5 text-ardoco-muted hover:text-ardoco-text"
                            >
                                <span className="sr-only">Close menu</span>
                                <XMarkIcon aria-hidden="true" className="h-6 w-6"/>
                            </button>
                        </div>
                        <div className="mt-6 text-sm">
                            <ApiAddressDisplay apiAddress={apiAddress} onEdit={() => {
                                setMobileMenuOpen(false);
                                setIsModalOpen(true);
                            }}/>
                        </div>
                        <div className="mt-6">
                            <div className="space-y-2">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            onClick={(e) => onClickMobileNavigation(item.href, e)}
                                            className="block rounded-lg px-3 py-2 text-sm text-ardoco-muted hover:bg-ardoco-surface hover:text-ardoco-accent"
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
