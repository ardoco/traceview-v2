import React, {createContext, useContext, useState} from "react";
import {
    Inconsistency, InconsistencyType, MissingModelInstanceInconsistency,
    MissingTextForModelElementInconsistency
} from "@/components/traceLinksResultViewer/views/inconsistencies/dataModel/Inconsistency";

interface InconsistencyContextProps {
    children: React.ReactNode;
    inconsistencies: Inconsistency[];
}

interface InconsistencyContextType {
    highlightedInconsistencies: Inconsistency[];
    highlightedSentenceInconsistencies: MissingModelInstanceInconsistency[];
    highlightedModelInconsistencies: MissingTextForModelElementInconsistency[];
    highlightSingleInconsistency: (inconsistency:Inconsistency) => void;
    inconsistencies: Inconsistency[];
    modelInconsistencies: MissingTextForModelElementInconsistency[];
    sentenceInconsistencies: MissingModelInstanceInconsistency[];
    highlightInconsistencyWithSentence: (sentence: number) => void;
    highlightInconsistencyWithModelId: (modelElementId: string) => void;
    resetHighlightedInconsistencies: () => void;
    highlightingColorInconsistencies: string;
}

const InconsistencyContext = createContext<InconsistencyContextType | undefined>(undefined);

export const useInconsistencyContext = () => {
    const context = useContext(InconsistencyContext);
    if (!context) {
        throw new Error("useInconsistencyContext must be used within an InconsistencyProvider");
    }
    return context;
}


export function InconsistencyProvider({children, inconsistencies}: InconsistencyContextProps) {
    const [highlightedInconsistencies, setHighlightedInconsistencies] = useState<Inconsistency[]>(inconsistencies);

    // red for  inconsistencies
    // const highlightingColor = "#CDC392";
    const highlightingColor = "#EDEEC9";

    const highlightSingleInconsistency = (inconsistency: Inconsistency) => {
        if (inconsistency === undefined || inconsistency === null) {
            console.warn("Tried to highlight an undefined or null inconsistency");
            return;
        }

        // // Unhighlight the inconsistency if it's already highlighted
        // if (highlightedInconsistencies.includes(inconsistency)) {
        //     setHighlightedInconsistencies(prev => prev.filter(item => item !== inconsistency));
        //     return;
        // }

        setHighlightedInconsistencies([inconsistency]);
    };

    const highlightInconsistencyWithSentence = (sentence: number)=> {
        const inconsistency = inconsistencies
            .find(inc => inc.type === InconsistencyType.MissingModelInstance && (inc as MissingModelInstanceInconsistency).sentenceNumber === sentence);
        if (inconsistency) {
            highlightSingleInconsistency(inconsistency);
        } else {
            setHighlightedInconsistencies([]);
            console.warn(`No inconsistency found for sentence number ${sentence}`);
        }
    }

    const highlightInconsistencyWithModelId = (modelElementId: string) => {
        const inconsistency = inconsistencies
            .find(inc => inc.type === InconsistencyType.MissingTextForModelElement && (inc as MissingTextForModelElementInconsistency).modelElementId === modelElementId);
        if (inconsistency) {
            highlightSingleInconsistency(inconsistency);
        } else {
            setHighlightedInconsistencies([]);
            console.warn(`No inconsistency found for model element ID ${modelElementId}`);
        }
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
            highlightSingleInconsistency,
            inconsistencies,
            modelInconsistencies,
            sentenceInconsistencies,
            highlightInconsistencyWithSentence,
            highlightInconsistencyWithModelId,
            resetHighlightedInconsistencies,
            highlightingColorInconsistencies : highlightingColor
        }}>
            {children}
        </InconsistencyContext.Provider>
    );

}