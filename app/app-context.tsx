'use client'

import { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext({
    useVoice: false,
    toggleVoice: () => { },
    isRecording: false,
    setRecording: (v: boolean) => { },
    isReading: false,
    setReading: (v: boolean) => { },
    language: "lt",
    setLanguage: (v: string) => { },
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
    const [isReading, setReading] = useState(false)
    const [language, setLanguage] = useState("lt")

    return (
        <AppContext.Provider
            value={{
                useVoice,
                toggleVoice,
                isRecording,
                setRecording,
                isReading,
                setReading,
                language,
                setLanguage
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext)
