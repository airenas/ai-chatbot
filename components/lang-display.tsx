'use client'


import { useAppContext } from '@/app/app-context';
import Flag from 'react-world-flags';
import { Button } from './ui/button';

export function LanguageDisplay() {
  const { language } = useAppContext()

  function getFlagCode(lang: string): string {
    const ls = lang.toUpperCase()
    switch (ls) {
      case 'EN':
        return 'GB'
      case 'UNK':
        return 'LT'
      default:
        return ls
    }
  }

  return (
    <>
      {language !== 'lt' ? (
        <>
          <Button
            variant="ghost"
            size="icon" 
            disabled={true}
            >
            <Flag code={getFlagCode(language)} style={{ width: '25px' }} />
          </Button>

        </>
      ) : (
        <></>
      )}
    </>

  )
}
