'use client';

import {useEffect, useState} from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useApiAddressContext } from '@/contexts/ApiAddressContext';

interface EditApiAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EditApiAddressModal({ isOpen, onClose }: EditApiAddressModalProps) {
    const { setApiAddress, apiAddress } = useApiAddressContext();
    const [input, setInput] = useState(apiAddress ?? "");
    const [warningMessage, setWarningMessage] = useState('');

    const handleClose = () => {
        // reset input to the current API address when closing
        setInput(apiAddress ?? "");
        setWarningMessage('');
        onClose();
    };

    useEffect(() => {
        setInput(apiAddress ?? "");
    }, [apiAddress]);

    const handleSave = async () => {
        if (!input.trim()) {
            setWarningMessage('URL cannot be empty.');
            return;
        }
        try {
            // Check if the URL format is valid
            new URL(input);
        } catch (_) {
            setWarningMessage('Please enter a valid URL format (e.g., http://example.com).');
            return;
        }

        // Attempt to save the address
        const isSuccess = await setApiAddress(input);

        if (isSuccess) {
            handleClose();
        } else {
            setWarningMessage('Could not connect to the API at this address.');
        }
    };

    return (
        <Dialog as="div" className="relative z-[100]" open={isOpen} onClose={handleClose}>
            <div className="fixed inset-0 bg-black/30" />
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                        <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900">
                            Edit API Server Address
                        </DialogTitle>
                        <div className="mt-4">
                            <p className="text-sm text-gray-600">
                                Enter the base URL for the ArDoCo REST API.
                            </p>
                            <input
                                type="url"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />

                            {warningMessage && (
                                <p className="mt-2 text-sm text-red-600">
                                    {warningMessage}
                                </p>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end gap-x-3">
                            <button type="button" className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200" onClick={handleClose}>
                                Cancel
                            </button>
                            <button type="button" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none" onClick={handleSave}>
                                Save
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}