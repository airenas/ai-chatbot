'use client'

import { IconLTPolicija, IconShare, IconStop, IconUser } from '@/components/ui/icons'
import { useStreamableText } from '@/lib/hooks/use-streamable-text'
import { Streamer } from '@/lib/stream-value'
import { cn } from '@/lib/utils'
import { useRef, useState } from 'react'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { MemoizedReactMarkdown } from '../markdown'
import { CodeBlock } from '../ui/codeblock'
import { spinner } from './spinner'

// Different types of message bubbles.

export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex size-[25px] shrink-0 select-none items-center justify-center rounded-md border bg-background shadow-sm">
        <IconUser />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden pl-2">
        {children}
      </div>
    </div>
  )
}

export function BotMessage({
  content,
  className
}: {
  content: string | Streamer
  className?: string
}) {
  const text = useStreamableText(content)
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function handleTTSClick(event: any): void {
    event.preventDefault()
    console.log('TTS clicked')
    event.preventDefault();
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        console.log('stop audio')
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } else {
        console.log('new audio')
      }
      const audio = new Audio('http://localhost:8007/ai-demo-service/tts');
      audioRef.current = audio;
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  }

  return (
    <div className={cn('group relative flex items-start md:-ml-12', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
        <IconLTPolicija />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        <MemoizedReactMarkdown
          className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
          remarkPlugins={[remarkGfm, remarkMath]}
          components={{
            p({ children }) {
              return <p className="mb-2 last:mb-0">{children}</p>
            },
            code({ node, inline, className, children, ...props }) {
              if (children.length) {
                if (children[0] == '▍') {
                  return (
                    <span className="mt-1 animate-pulse cursor-default">▍</span>
                  )
                }

                children[0] = (children[0] as string).replace('`▍`', '▍')
              }

              const match = /language-(\w+)/.exec(className || '')

              if (inline) {
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                )
              }

              return (
                <CodeBlock
                  key={Math.random()}
                  language={(match && match[1]) || ''}
                  value={String(children).replace(/\n$/, '')}
                  {...props}
                />
              )
            }
          }}
        >
          {text}
        </MemoizedReactMarkdown>
      </div>
      {(isHovered || isPlaying) && (
        <div
          className="absolute bottom-0 left-4 mb-2 ml-2"
          onClick={handleTTSClick}
        >
          {isPlaying ? <IconStop /> : <IconShare />}
        </div>
      )}
    </div>
  )
}

export function BotCard({
  children,
  showAvatar = true
}: {
  children: React.ReactNode
  showAvatar?: boolean
}) {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div
        className={cn(
          'flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm',
          !showAvatar && 'invisible'
        )}
      >
        <IconLTPolicija />
      </div>
      <div className="ml-4 flex-1 pl-2">{children}</div>
    </div>
  )
}

export function SystemMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={
        'mt-2 flex items-center justify-center gap-2 text-xs text-gray-500'
      }
    >
      <div className={'max-w-[600px] flex-initial p-2'}>{children}</div>
    </div>
  )
}

export function SpinnerMessage() {
  return (
    <div className="group relative flex items-start md:-ml-12">
      <div className="flex size-[24px] shrink-0 select-none items-center justify-center rounded-md border bg-primary text-primary-foreground shadow-sm">
        <IconLTPolicija />
      </div>
      <div className="ml-4 h-[24px] flex flex-row items-center flex-1 space-y-2 overflow-hidden px-1">
        {spinner}
      </div>
    </div>
  )
}
