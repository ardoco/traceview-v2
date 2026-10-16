'use client';

import React, {createContext, useContext, useSyncExternalStore} from 'react';

// Default base URL
const DEFAULT_API = 'https://rest.ardoco.de';

type ApiAddressContextType = {
    apiAddress: string | null;
    setApiAddress: (newAddress: string) => Promise<boolean>;
};

const ApiAddressContext = createContext<ApiAddressContextType | undefined>(undefined);

// localStorage is an external store: subscribe to it instead of copying it into state in an effect.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
    listeners.add(listener);
    window.addEventListener('storage', listener);
    return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', listener);
    };
}

function getSnapshot(): string | null {
    return localStorage.getItem('apiAddress') || DEFAULT_API;
}

// null on the server and during hydration, the real value afterwards
function getServerSnapshot(): string | null {
    return null;
}

export function ApiAddressProvider({children}: { children: React.ReactNode }) {
    const apiAddress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    const setApiAddress = async (newAddress: string) => {
        // Clean the input to store a clean base URL (e.g., http://127.0.0.1:8081)
        const cleanedAddress = newAddress.replace(/\/api\/?.*$/, "").replace(/\/$/, "");

        try {
            const testUrl = `/api/health`;

            const res = await fetch(testUrl, {
                method: 'GET',
                headers: {
                    'X-Target-API': cleanedAddress,
                },
            });

            if (!res.ok) {
                return false;
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem('apiAddress', cleanedAddress);
            }
            listeners.forEach((listener) => listener());
            return true;
        } catch {
            return false;
        }
    };

    return (
        <ApiAddressContext.Provider value={{apiAddress, setApiAddress}}>
            {children}
        </ApiAddressContext.Provider>
    );
}

export function useApiAddressContext() {
    const ctx = useContext(ApiAddressContext);
    if (!ctx) throw new Error('useApiAddress must be inside ApiAddressProvider');
    return ctx;
}