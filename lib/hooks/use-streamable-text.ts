import { useEffect, useState } from 'react'
import { Streamer } from '../stream-value'

export const useStreamableText = (
  content: string | Streamer
) => {
  const [rawContent, setRawContent] = useState(
    typeof content === 'string' ? content : ''
  )

  useEffect(() => {
    ; (async () => {
      if (typeof content === 'object') {
        let value = ''
        for await (const delta of content.stringToAsyncIterable()) {
          if (typeof delta === 'string') {
            setRawContent((value = value + delta))
          }
        }
      }
    })()
  }, [content])

  return rawContent
}
