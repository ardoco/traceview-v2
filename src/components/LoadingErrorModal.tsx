'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

interface LoadingErrorModalProps {
    isOpen: boolean;
    message: string;
    onRetry: () => void;
    onViewFiles: () => void;
}

export default function LoadingErrorModal({ isOpen, message, onRetry, onViewFiles }: LoadingErrorModalProps) {
    if (!isOpen) return null;

    return (
        <Dialog as="div" className="relative z-[100]" open={isOpen} onClose={() => { /* Do nothing on overlay click */ }}>
            <div className="fixed inset-0 bg-black/30" />
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl">
                        <DialogTitle as="h3" className="text-lg font-medium leading-6 text-red-600">
                            An Error Occurred
                        </DialogTitle>
                        <div className="mt-4">
                            <p className="text-sm text-gray-700">
                                {message}
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end gap-x-3">
                            <button type="button" className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300" onClick={onViewFiles}>
                                View Files Only
                            </button>
                            <button type="button" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700" onClick={onRetry}>
                                Retry
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}