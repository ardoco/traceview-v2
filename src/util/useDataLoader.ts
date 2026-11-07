'use client'

import {useEffect, useRef, useState} from "react";

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
    // The outcome is stored together with the id it belongs to, so that "loading" can be derived
    // during render (result is missing or belongs to another id) instead of being set in an effect.
    const [outcome, setOutcome] = useState<{
        id: string;
        data: T | null;
        fileContent: string | null;
        error: string | null;
    } | null>(null);

    // Always call the latest loader without re-running the effect when its identity changes
    // (callers pass inline functions).
    const loaderRef = useRef(loader);
    useEffect(() => {
        loaderRef.current = loader;
    });

    useEffect(() => {
        if (!id) {
            return;
        }

        let cancelled = false;
        loaderRef.current(id).then(
            (result) => {
                if (!cancelled) {
                    setOutcome({id, data: result.data, fileContent: result.fileContent, error: null});
                }
            },
            (e: unknown) => {
                if (!cancelled) {
                    const message = e instanceof Error ? e.message : String(e);
                    setOutcome({id, data: null, fileContent: null, error: `Failed to load or parse data: ${message}`});
                }
            }
        );

        return () => {
            cancelled = true;
        };
    }, [id]);

    const current = outcome !== null && outcome.id === id ? outcome : null;
    return {
        data: current?.data ?? null,
        fileContent: current?.fileContent ?? null,
        isLoading: current === null,
        error: current?.error ?? null,
    };
}
