'use client'


import { useAppContext } from '@/app/app-context'
import { Button } from '@/components/ui/button'

export function VoiceToggle() {
  const { useVoice, toggleVoice, isRecording } = useAppContext()

  return (
    <>
      {isRecording ? (
        <span color='red'>Recording { }</span>
      ) : (
        <span></span>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          toggleVoice()
        }}
      >
        {useVoice ? (
          <span>Voice</span>
          // <IconVoice className="transition-all" />
        ) : (
          <span>Text</span>
          // <IconText className="transition-all" />
        )}
        <span className="sr-only">Toggle voice</span>
      </Button>
    </>

  )
}
