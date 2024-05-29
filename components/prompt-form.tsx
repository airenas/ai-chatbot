'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { useActions, useUIState } from 'ai/rsc'

import { useAppContext } from '@/app/app-context'
import { Button } from '@/components/ui/button'
import { IconArrowElbow } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { type AI } from '@/lib/chat/actions'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { Streamer } from '@/lib/stream-value'
import { getWS } from '@/lib/websocket'
import { nanoid } from 'ai'
import { useRouter } from 'next/navigation'
import AudioRecorder from './audio-recorder'
import { BotMessage, SpinnerMessage, UserMessage } from './stocks/message'

export function PromptForm({
  input,
  setInput
}: {
  input: string
  setInput: (value: string) => void
}) {
  const router = useRouter()
  const { formRef, onKeyDown } = useEnterSubmit()
  const inputRef = React.useRef<HTMLTextAreaElement>(null)
  const { submitUserMessage } = useActions()
  const [_, setMessages] = useUIState<typeof AI>()
  const ws = getWS()
  const { useVoice, isRecording } = useAppContext()

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }

    ws.setMessageHandler((message: any) => {
      console.log('on message', message)
      let msg: any = null
      let id = message.id
      if (message.type === 'TEXT' && message.who === 'USER') {
        msg = <UserMessage>{message.data}</UserMessage>
      }
      if (message.type === 'TEXT' && message.who === 'RECOGNIZER') {
        console.log('on text', message.data)
        setInput(message.data);
        console.log('Input state updated:', input);
      }
      if (message.type === 'STATUS' && message.who === 'BOT' && message.data === 'thinking') {
        msg = <SpinnerMessage />
        id = "spinner-" + id
      }
      if (message.type === 'TEXT' && message.who === 'BOT') {
        const streamable = new Streamer(message.data);
        msg = <BotMessage content={streamable} sessionId={message.session_id} id={message.id} />
      }
      if (msg !== null) {
        setMessages((currentMessages: any | { id: any }[]) => {
          if (currentMessages.length > 0) {
            console.log(currentMessages[currentMessages.length - 1])
          }
          if (currentMessages.length > 0 && currentMessages[currentMessages.length - 1].id.startsWith("spinner-")) {
            console.log('spinner')
            currentMessages.pop()
          }
          if (currentMessages.length > 0 && currentMessages[currentMessages.length - 1].id == id) {
            currentMessages[currentMessages.length - 1].display = msg
            console.log('msg id same', currentMessages[currentMessages.length - 1])
            id = id + '-1'
            currentMessages.pop()
          }
          // console.log('msg id', id)
          return [
            ...currentMessages,
            {
              id: id,
              display: msg
            }
          ]

        })
      }
    })
  }, [setInput, input, setMessages, ws])

  return (
    <form
      ref={formRef}
      onSubmit={async (e: any) => {
        e.preventDefault()

        // Blur focus on mobile
        if (window.innerWidth < 600) {
          e.target['message']?.blur()
        }

        const value = input.trim()
        setInput('')
        if (!value) return

        const id = nanoid()
        ws.sendTxt(id, value)

        // Optimistically add user message UI
        setMessages(currentMessages => [
          ...currentMessages,
          {
            id: id,
            display: <UserMessage>{value}</UserMessage>
          }
        ])
      }}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Siųskite žinutę."
          className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          name="message"
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
        />

        {useVoice ? (
          <div className="absolute right-0 top-[13px] sm:right-4">
            <AudioRecorder />
          </div>
        ) : (
          <div className="absolute right-0 top-[13px] sm:right-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="submit" size="icon" disabled={input === ''}>
                  <IconArrowElbow />
                  <span className="sr-only">Siųsti žinutę</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Siųsti žinutę</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </form>
  )
}
