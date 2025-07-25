'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';

interface ConfirmModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmNavigationModal({ isOpen, onConfirm, onCancel }: ConfirmModalProps) {
    return (
        <Dialog as="div" className="relative z-[100]" open={isOpen} onClose={onCancel}>
            <div className="fixed inset-0 bg-black/30" />
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                        <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900">
                            Leave Page?
                        </DialogTitle>
                        <div className="mt-4">
                            <p className="text-sm text-gray-600">
                                Navigating away will delete the current project's data from your browser. Are you sure you want to continue?
                            </p>
                        </div>
                        <div className="mt-6 flex justify-end gap-x-3">
                            <button type="button" className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200" onClick={onCancel}>
                                Cancel
                            </button>
                            <button type="button" className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700" onClick={onConfirm}>
                                Leave Page
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}