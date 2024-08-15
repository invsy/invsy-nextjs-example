import { type Metadata } from 'next'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { getChat, getMissingKeys } from '@/app/actions'
import { Chat } from '@/components/chat'
import { AI } from '@/lib/chat/actions'

export interface ChatPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: ChatPageProps): Promise<Metadata> {
  const session =  auth()

  if (!session?.user) {
    return {}
  }

  const chat = await getChat(params.id)

  if (!chat || 'error' in chat) {
    redirect('/')
  } else {
    return {
      title: chat?.meta.title.toString().slice(0, 50) ?? 'Chat'
    }
  }
}

export default async function ChatPage({ params }: ChatPageProps) {
  const session = auth()
  const missingKeys = await getMissingKeys()

  const userId = session.user.id as string
  const chat = await getChat(params.id)

  return (
    <AI initialAIState={{ chat }}>
      <Chat
        id={chat.id}
        session={session}
        initialMessages={chat.messages}
        missingKeys={missingKeys}
      />
    </AI>
  )
}
