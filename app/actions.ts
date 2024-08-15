'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { kv } from '@vercel/kv';

import { auth } from '@/auth';
import { type Chat } from '@/lib/types';
import { invsy } from '@/lib/invsy-client';

export async function createChat() {
  // TODO: should not need to pass in meta!!
  return await invsy.create({
    title: 'New chat',
    path: '/',
    share_path: '/'
  })
}

export async function updateChatMeta(chatId: string, meta: any) {
  return await invsy.modify(chatId, meta)
}

export async function getChats() {
  return  await invsy.list()
}

export async function getChat(id: string) {
  return await invsy.retrieve(id)
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  await invsy.delete(id)

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  await invsy.deleteAll()

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  const chat = await kv.hgetall<Chat>(`chat:${id}`)

  if (!chat || chat.userId !== session.user.id) {
    return {
      error: 'Something went wrong'
    }
  }

  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`
  }

  await kv.hmset(`chat:${chat.id}`, payload)

  return payload
}

export async function saveChat(chat: Chat) {
  // we get the last message in the messages array
  await invsy.update(chat.id, {
    role: chat.messages[chat.messages.length - 1].role,
    // TODO: make type any or ai sdk type
    content: chat.messages[chat.messages.length - 1].content
  })
}

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = ['OPENAI_API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}
