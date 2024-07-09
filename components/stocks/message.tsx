'use client'

import { useAppContext } from '@/app/app-context'
import { IconLTPolicija, IconSpinner, IconUser } from '@/components/ui/icons'
import { useStreamableText } from '@/lib/hooks/use-streamable-text'
import { Streamer } from '@/lib/stream-value'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { PiPlayCircleBold, PiStopCircleBold } from "react-icons/pi"
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
  className,
  sessionId,
  id,
  language,
}: {
  content: string | Streamer
  className?: string
  sessionId?: string
  id?: string
  language?: string
}) {
  const text = useStreamableText(content)
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wasPlayed, setWasPlayed] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { isReading, setReading, useVoice } = useAppContext();
  const url = process.env.NEXT_PUBLIC_BOT_URL || '__BOT_URL__'

  function setIsHoveredInt(v: boolean): void {
    if (language === 'lt') {
      setIsHovered(v)
    }
  }

  function handleTTSClick(event: any): void {
    event.preventDefault()
    console.debug('TTS clicked')
    event.preventDefault();
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }

  function stop(): void {
    console.debug('stop audio')
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsLoading(false);
    setReading(false);
  }

  function play(): void {
    console.debug('call play')
    if (!isPlaying && !isReading) {
      setIsLoading(true);
      if (audioRef.current) {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        } catch (error: any) {
          console.warn('stop audio', error)
        }
      } else {
        console.debug('new audio')
      }
      const audio = new Audio(`${url}/ai-demo-service/tts/${sessionId}/${id}`);
      audioRef.current = audio;

      audio.oncanplaythrough = () => {
        setIsLoading(false);
      };
      audio.onended = () => {
        setIsPlaying(false);
        setReading(false);
      }
      audio.onerror = (err) => {
        console.warn('error audio', err)
      }
      console.debug('call play')
      audio.play().catch((e)=>{
        console.warn('error playing audio', e)     });
      setIsPlaying(true);
      setReading(true);
    }
  }

  useEffect(() => {
    console.debug('useEffect bot message')
    if (!wasPlayed && !isReading && useVoice && language === 'lt') {
      setWasPlayed(true);
      play();
    } else {
      console.log('skip play')
    }

    return () => {
      try {
        stop();
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Audio playback stopped');
        } else {
          console.error('Error stopping audio playback:', error);
        }
      }
    };
  }, []);

  return (
    <div className={cn('group relative flex items-start md:-ml-12', className)}
      onMouseEnter={() => setIsHoveredInt(true)}
      onMouseLeave={() => setIsHoveredInt(false)}
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
          className="absolute bottom-0 left-0 mb-0 ml-1"
          onClick={handleTTSClick}
        >
          {isPlaying ? (isLoading ? <IconSpinner className="size-5" /> : <PiStopCircleBold size={20} />) :
            <PiPlayCircleBold size={20} style={{ opacity: isReading ? 0.5 : 1 }} />}
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
