'use client'

import { createContext, useContext, useState } from 'react'

const AppContext = createContext({
    useVoice: false,
    toggleVoice: () => { },
    isRecording: false,
    setRecording: (v: boolean) => { },
})

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const [useVoice, setUseVoice] = useState(false)
    const toggleVoice = () => setUseVoice(prev => !prev)
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
