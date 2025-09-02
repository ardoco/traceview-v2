import React, {createContext, useContext, useState} from "react";
import {
    Inconsistency,
    InconsistencyType,
    MissingModelInstanceInconsistency,
    MissingTextForModelElementInconsistency
} from "@/components/traceLinksResultViewer/views/inconsistencies/dataModel/Inconsistency";
import {useHighlightContext} from "@/contexts/HighlightTracelinksContextType";
import {DisplayOption} from "@/components/dataTypes/DisplayOption";
import {MessageSource} from "@/components/dataTypes/MessageSource";

interface InconsistencyContextProps {
    children: React.ReactNode;
    inconsistencies: Inconsistency[];
    loading: boolean; // indicate loading state
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
    messageSource: MessageSource;
    loading: boolean;
}

const InconsistencyContext = createContext<InconsistencyContextType | undefined>(undefined);

export const useInconsistencyContext = () => {
    const context = useContext(InconsistencyContext);
    if (!context) {
        throw new Error("useInconsistencyContext must be used within an InconsistencyProvider");
    }
    return context;
}


export function InconsistencyProvider({
                                          children,
                                          inconsistencies,
                                          loading
                                      }: InconsistencyContextProps) {
    const [highlightedInconsistencies, setHighlightedInconsistencies] = useState<Inconsistency[]>([]);
    const [lastSearchTimestamp, setLastSearchTimestamp] = useState(0);
    const [messageSource, setMessageSource] = useState<MessageSource>(MessageSource.NONE);
    const {setLastClickedSource} = useHighlightContext();
    const useInconsistencies = inconsistencies && inconsistencies.length > 0;

    const modelInconsistencies: MissingTextForModelElementInconsistency[] =
        inconsistencies
            .filter((inconsistency) => inconsistency.type === InconsistencyType.MissingTextForModelElement) as MissingTextForModelElementInconsistency[];

    const sentenceInconsistencies: MissingModelInstanceInconsistency[] =
        inconsistencies
            .filter((inconsistency) => inconsistency.type === InconsistencyType.MissingModelInstance) as MissingModelInstanceInconsistency[];

    const highlightedSentenceInconsistencies: MissingModelInstanceInconsistency[] =
        highlightedInconsistencies
            .filter((inconsistency) => inconsistency.type === InconsistencyType.MissingModelInstance) as MissingModelInstanceInconsistency[];

    const highlightedModelInconsistencies: MissingTextForModelElementInconsistency[] =
        highlightedInconsistencies
            .filter((inconsistency) => inconsistency.type === InconsistencyType.MissingTextForModelElement) as MissingTextForModelElementInconsistency[];


    const highlightSingleInconsistency = (inconsistency: Inconsistency) => {
        if (!useInconsistencies) {
            return;
        }
        setHighlightedInconsistencies([inconsistency]);
        setMessageSource(MessageSource.INCONSISTENCY_ONLY);
        setLastSearchTimestamp(Date.now());
        setLastClickedSource(inconsistency.id, DisplayOption.INCONSISTENCIES);
    }

    const highlightInconsistencyWithSentence = (sentence: number) => {
        if (!useInconsistencies) {
            return;
        }

        const inconsistency = inconsistencies
            .filter(inc => inc.type === InconsistencyType.MissingModelInstance && (inc as MissingModelInstanceInconsistency).sentenceNumber === sentence);
        if (inconsistency) {
            setHighlightedInconsistencies(inconsistency);
        } else {
            setHighlightedInconsistencies([]);
            console.warn(`No inconsistency found for sentence number ${sentence}`);
        }
        setMessageSource(MessageSource.ELEMENT_CLICK);
        setLastSearchTimestamp(Date.now());
        setLastClickedSource(sentence, DisplayOption.DOCUMENTATION);
    }

    const highlightInconsistencyWithModelId = (modelElementId: string) => {
        if (!useInconsistencies) {
            return;
        }
        const inconsistency = inconsistencies
            .filter(inc => inc.type == InconsistencyType.MissingTextForModelElement && (inc as MissingTextForModelElementInconsistency).modelElementId === modelElementId);
        if (inconsistency) {
            setHighlightedInconsistencies(inconsistency);
        } else {
            setHighlightedInconsistencies([]);
            console.warn(`No inconsistency found for model element ID ${modelElementId}`);
        }
        setMessageSource(MessageSource.ELEMENT_CLICK);
        setLastSearchTimestamp(Date.now());
        setLastClickedSource(modelElementId, DisplayOption.ARCHITECTURE_MODEL);
    }

    const resetHighlightedInconsistencies = () => {
        setHighlightedInconsistencies([]);
        setMessageSource(MessageSource.NONE);
    }

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
            highlightSingleInconsistency,
            messageSource,
            loading
        }}>
            {children}
        </InconsistencyContext.Provider>
    );

}