'use client'

import { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext({
    useVoice: false,
    toggleVoice: () => { },
    isRecording: false,
    setRecording: (v: boolean) => { },
})

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [useVoice, setUseVoice] = useState<boolean>(() => {
        // Initialize useVoice from local storage
        const saved = localStorage.getItem('useVoice');
        return saved ? JSON.parse(saved) : false;
    });

    const toggleVoice = () => setUseVoice(prev => !prev);

    useEffect(() => {
        localStorage.setItem('useVoice', JSON.stringify(useVoice));
    }, [useVoice]);

    const [isRecording, setRecording] = useState(false)

    return (
        <AppContext.Provider
            value={{
                useVoice,
                toggleVoice,
                isRecording,
                setRecording,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext)
