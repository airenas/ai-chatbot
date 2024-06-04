'use client'


import { useAppContext } from '@/app/app-context'
import { Button } from '@/components/ui/button'
import { PiRecordFill, PiSpeakerHighBold } from 'react-icons/pi'

export function AudioDisplay() {
  const { isRecording, isReading } = useAppContext()

  return (
    <>
      {isReading ? (
        <Button
          variant="ghost"
          size="icon"
          disabled={true}>
          <PiSpeakerHighBold />
        </Button>
      ) : (
        <span></span>
      )}
      {isRecording ? (
        <Button
          variant="ghost"
          size="icon"
          disabled={true}>
          <PiRecordFill />
        </Button>
      ) : (
        <span></span>
      )}
    </>

  )
}
