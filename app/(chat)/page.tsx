import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'
import { auth } from '@/auth'
import { Session } from '@/lib/types'
import { createChat, getMissingKeys } from '@/app/actions';

export const metadata = {
  title: 'Next.js AI Chatbot'
}

export default async function IndexPage() {
  // TODO: should only need to return id { id }
  const chat = await createChat()

  const session = (auth()) as Session
  const missingKeys = await getMissingKeys()

  return (
    <AI initialAIState={{ chat }}>
      <Chat id={chat.id} session={session} missingKeys={missingKeys} />
    </AI>
  )
}
