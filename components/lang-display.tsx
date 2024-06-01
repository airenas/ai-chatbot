'use client'


import { useAppContext } from '@/app/app-context'

export function LanguageDisplay() {
  const { language } = useAppContext()

  return (
    <>
      {language !== 'lt' ? (
        <><span color='red'>{language.toUpperCase()}</span><span> </span></>
        ) : (
        <span></span>
      )}
    </>

  )
}
