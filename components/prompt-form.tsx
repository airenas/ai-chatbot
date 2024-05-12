'use client'

import * as React from 'react'
import Textarea from 'react-textarea-autosize'

import { useActions, useUIState } from 'ai/rsc'

import { Button } from '@/components/ui/button'
import { IconArrowElbow, IconPlus } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { type AI } from '@/lib/chat/actions'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { getWS } from '@/lib/websocket'
import { nanoid } from 'nanoid'
import { useRouter } from 'next/navigation'
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

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }

    ws.setMessageHandler((message: any) => {
      console.log('on message', message)
      let msg = null
      let id = message.id
      if (message.type === 'TEXT' && message.who === 'USER') {
        msg = <UserMessage>{message.data}</UserMessage>
      }
      if (message.type === 'STATUS' && message.who === 'BOT' && message.data === 'thinking') {
        msg = <SpinnerMessage />
        id="spinner-" + id
      }
      if (message.type === 'TEXT' && message.who === 'BOT') {
        msg = <BotMessage content={message.data} />
      }
      if (msg !== null) {
        setMessages(currentMessages => {
          if (currentMessages.length > 0) {
            console.log(currentMessages[currentMessages.length - 1])
          }
          if (currentMessages.length > 0 && currentMessages[currentMessages.length - 1].id.startsWith("spinner-")) {
            console.log('spinner')
            currentMessages.pop()
          }
          if (currentMessages.length > 0 && currentMessages[currentMessages.length - 1].id == id) {
            console.log('id same')
            currentMessages.pop()
          }
          return [
            ...currentMessages,
            {
              id: id,
              display: msg
            }
          ]})
      }
    })
  }, [])

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

        ws.sendTxt(value)

        // // Optimistically add user message UI
        // setMessages(currentMessages => [
        //   ...currentMessages,
        //   {
        //     id: nanoid(),
        //     display: <UserMessage>{value}</UserMessage>
        //   }
        // ])

        // Submit and get response message
        // const responseMessage = await submitUserMessage(value)
        // setMessages(currentMessages => [...currentMessages, responseMessage])
      }}
    >
      <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-[14px] size-8 rounded-full bg-background p-0 sm:left-4"
              onClick={() => {
                router.push('/new')
              }}
            >
              <IconPlus />
              <span className="sr-only">New Chat</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
        <Textarea
          ref={inputRef}
          tabIndex={0}
          onKeyDown={onKeyDown}
          placeholder="Send a message."
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
        <div className="absolute right-0 top-[13px] sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="submit" size="icon" disabled={input === ''}>
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  )
}
