'use client'
import { ThemeToggle } from './theme-toggle'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { IconPlus } from '@/components/ui/icons'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useRouter } from 'next/navigation'
import { LanguageDisplay } from './lang-display'
import { VoiceToggle } from './voice-toggle'


export function Header() {
  const router = useRouter()
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
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
            <span className="sr-only">Naujas pojakbis</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Naujas pokalbis</TooltipContent>
      </Tooltip>
      <div className="flex items-center">
        <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
        </React.Suspense>
      </div>
      <div>
        <LanguageDisplay />
        <VoiceToggle />
        <ThemeToggle />
      </div>
    </header>
  )
}
