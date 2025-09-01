'use client'

import {useEffect, useState} from "react";

/**
 * Defines the return type of the loader function for the useDataLoader hook.
 */
export interface LoaderResult<T> {
    data: T | null;
    fileContent: string | null;
}

/**
 * A generic custom hook for loading data from a file or external source.
 * It handles the loading, error, and mounted states, and expects the loader function
 * to perform the data fetching and parsing.
 *
 * @param id The projectId used to fetch the data.
 * @param loader An async function that takes the projectId and returns a LoaderResult.
 * @returns An object containing the loaded data, raw file content, loading status, and any error.
 */
export function useDataLoader<T>(id: string, loader: (id: string) => Promise<LoaderResult<T>>) {
    const [data, setData] = useState<T | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState<boolean>(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted || !id) {
            if (id) setIsLoading(false);
            return;
        }

        async function loadData() {
            setIsLoading(true);
            setError(null);
            setData(null);
            setFileContent(null);

            try {
                const result = await loader(id);
                setData(result.data);
                setFileContent(result.fileContent);
            } catch (e: any) {
                setError(`Failed to load or parse data: ${e.message}`);
            } finally {
                setIsLoading(false);
            }
        }

        loadData();
    }, [id, isMounted]);

    return {data, fileContent, isLoading, error};
}