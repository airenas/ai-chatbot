import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { nanoid } from '@/lib/utils'

export const metadata = {
  title: 'Policijos pagalbos robotas'
}

export default async function IndexPage() {
  const id = nanoid()
  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <Chat id={id} session={undefined} missingKeys={[]} />
    </AI>
  )
}
