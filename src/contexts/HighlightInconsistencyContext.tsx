import React, {createContext, useContext, useState} from "react";
import {
    Inconsistency, InconsistencyType, MissingModelInstanceInconsistency,
    MissingTextForModelElementInconsistency
} from "@/components/traceLinksResultViewer/views/inconsistencies/dataModel/Inconsistency";

interface InconsistencyContextProps {
    children: React.ReactNode;
    inconsistencies: Inconsistency[];
    useInconsitencies: boolean;
}

interface InconsistencyContextType {
    highlightedInconsistencies: Inconsistency[];
    highlightedSentenceInconsistencies: MissingModelInstanceInconsistency[];
    highlightedModelInconsistencies: MissingTextForModelElementInconsistency[];
    inconsistencies: Inconsistency[];
    modelInconsistencies: MissingTextForModelElementInconsistency[];
    sentenceInconsistencies: MissingModelInstanceInconsistency[];
    highlightInconsistencyWithSentence: (sentence: number) => void;
    highlightInconsistencyWithModelId: (modelElementId: string) => void;
    resetHighlightedInconsistencies: () => void;
    lastSearchTimestamp: number;
    highlightSingleInconsistency: (inconsistency: Inconsistency) => void;
}

const InconsistencyContext = createContext<InconsistencyContextType | undefined>(undefined);

export const useInconsistencyContext = () => {
    const context = useContext(InconsistencyContext);
    if (!context) {
        throw new Error("useInconsistencyContext must be used within an InconsistencyProvider");
    }
    return context;
}


export function InconsistencyProvider({children, inconsistencies, useInconsitencies}: InconsistencyContextProps) {
    const [highlightedInconsistencies, setHighlightedInconsistencies] = useState<Inconsistency[]>(inconsistencies);
    const [lastSearchTimestamp, setLastSearchTimestamp] = useState(0);

    const highlightSingleInconsistency = (inconsistency: Inconsistency) => {
        setHighlightedInconsistencies([inconsistency]);
        setLastSearchTimestamp(Date.now());
    }

    const highlightInconsistencyWithSentence = (sentence: number)=> {
        const inconsistency = inconsistencies
            .filter(inc => inc.type === InconsistencyType.MissingModelInstance && (inc as MissingModelInstanceInconsistency).sentenceNumber === sentence);
        if (inconsistency) {
            setHighlightedInconsistencies(inconsistency);
        } else {
            setHighlightedInconsistencies([]);
            console.warn(`No inconsistency found for sentence number ${sentence}`);
        }
        setLastSearchTimestamp(Date.now());
    }

    const highlightInconsistencyWithModelId = (modelElementId: string) => {
        const inconsistency = inconsistencies
            .filter(inc => inc.type == InconsistencyType.MissingTextForModelElement && (inc as MissingTextForModelElementInconsistency).modelElementId === modelElementId);
        if (inconsistency) {
            setHighlightedInconsistencies(inconsistency);
        } else {
            setHighlightedInconsistencies([]);
            console.warn(`No inconsistency found for model element ID ${modelElementId}`);
        }
        setLastSearchTimestamp(Date.now());
    }

    const resetHighlightedInconsistencies = () => {
        setHighlightedInconsistencies([]);
    }

    let modelInconsistencies: MissingTextForModelElementInconsistency[] =
        inconsistencies
            .filter((inconsistency) => inconsistency.type === InconsistencyType.MissingTextForModelElement) as MissingTextForModelElementInconsistency[];

    let sentenceInconsistencies: MissingModelInstanceInconsistency[] =
        inconsistencies
            .filter((inconsistency) => inconsistency.type === InconsistencyType.MissingModelInstance) as MissingModelInstanceInconsistency[];

    let highlightedSentenceInconsistencies: MissingModelInstanceInconsistency[] =
        highlightedInconsistencies
            .filter((inconsistency) => inconsistency.type === InconsistencyType.MissingModelInstance) as MissingModelInstanceInconsistency[];

    let highlightedModelInconsistencies: MissingTextForModelElementInconsistency[] =
        highlightedInconsistencies
            .filter((inconsistency) => inconsistency.type === InconsistencyType.MissingTextForModelElement) as MissingTextForModelElementInconsistency[];


    return (
        <InconsistencyContext.Provider value={{
            highlightedInconsistencies,
            highlightedSentenceInconsistencies,
            highlightedModelInconsistencies,
            inconsistencies,
            modelInconsistencies,
            sentenceInconsistencies,
            highlightInconsistencyWithSentence,
            highlightInconsistencyWithModelId,
            resetHighlightedInconsistencies,
            lastSearchTimestamp,
            highlightSingleInconsistency
        }}>
            {children}
        </InconsistencyContext.Provider>
    );

}