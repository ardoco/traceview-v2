'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Default base URL
const DEFAULT_API = 'https://rest.ardoco.de';

type ApiAddressContextType = {
    apiAddress: string;
    setApiAddress: (newAddress: string) => Promise<boolean>;
};

const ApiAddressContext = createContext<ApiAddressContextType | undefined>(undefined);

export function ApiAddressProvider({ children }: { children: React.ReactNode }) {
    const [apiAddress, setApiAddressState] = useState( DEFAULT_API);

    useEffect(() => {
        const stored = localStorage.getItem('apiAddress');
        if (stored) {
            setApiAddressState(stored);
        }
    }, []);

    const setApiAddress = async (newAddress: string) => {
        // Clean the input to store a clean base URL (e.g., http://127.0.0.1:8081)
        const cleanedAddress = newAddress.replace(/\/api\/?.*$/, "").replace(/\/$/, "");
        console.log("cleaned Address", cleanedAddress)

        try {
            const testUrl = `/api/configuration`;

            const res = await fetch(testUrl, {
                method: 'GET',
                headers: {
                    'X-Target-API': cleanedAddress,
                },
            });

            if (!res.ok) {
                return false;
            }

            // save the address in local storage so the user does not have to enter it again
            if (typeof window !== 'undefined') {
                localStorage.setItem('apiAddress', cleanedAddress);
            }
            setApiAddressState(cleanedAddress);
            return true;
        } catch (err) {
            //console.error(err);
            return false;
        }
    };

    return (
        <ApiAddressContext.Provider value={{ apiAddress, setApiAddress }}>
            {children}
        </ApiAddressContext.Provider>
    );
}

export function useApiAddressContext() {
    const ctx = useContext(ApiAddressContext);
    if (!ctx) throw new Error('useApiAddress must be inside ApiAddressProvider');
    return ctx;
}