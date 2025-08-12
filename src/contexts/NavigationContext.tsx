// context to manage the confirmation of the project when leaving the view page.
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmNavigationModal from '@/components/ConfirmNavigationModal';
import { deleteProjectDirectory } from '@/util/ClientFileStorage';
type NavigationContextType = {
    handleNavigation: (path: string) => void;
    setCurrentProjectId: (id: string | null) => void;
    controller: AbortController;
    abortController: () => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nextPath, setNextPath] = useState<string | null>(null);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [controller, setController] = useState<AbortController>(new AbortController());

    const handleNavigation = (path: string) => {
        if (currentProjectId) {
            setNextPath(path);
            setIsModalOpen(true);
        } else {
            router.push(path);
        }
    };

    const confirmAndNavigate = async () => {
        console.log(`Deleting project directory for ID: ${currentProjectId}`);
        if (currentProjectId) {
            await deleteProjectDirectory(currentProjectId);
            setCurrentProjectId(null);
            abortController(); // Abort any ongoing API requests related to the project
        }
        if (nextPath) {
            router.push(nextPath);
        }
        setIsModalOpen(false);
        setNextPath(null);
    };

    const cancelNavigation = () => {
        setIsModalOpen(false);
        setNextPath(null);
    };

    const abortController = () => {
        if (controller) {
            controller.abort("User is leaving the page or navigating away.");
        }
        setController(new AbortController()); // Reset the controller for future use
    }

    return (
        <NavigationContext.Provider value={{ handleNavigation, setCurrentProjectId, controller, abortController }}>
            {children}
            <ConfirmNavigationModal
                isOpen={isModalOpen}
                onConfirm={confirmAndNavigate}
                onCancel={cancelNavigation}
            />
        </NavigationContext.Provider>
    );
}

export const useNavigation = () => {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
};