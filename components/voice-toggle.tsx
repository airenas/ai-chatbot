'use client'


import { useAppContext } from '@/app/app-context'
import { Button } from '@/components/ui/button'
import { PiMicrophoneStageBold, PiTextTBold } from 'react-icons/pi'

export function VoiceToggle() {
  const { useVoice, toggleVoice } = useAppContext()

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          toggleVoice()
        }}
      >
        {useVoice ? (
          <PiMicrophoneStageBold className="transition-all" />
        ) : (
          <PiTextTBold className="transition-all" />
        )}
        <span className="sr-only">Perjungti audio režimą</span>
      </Button>
    </>

  )
}
