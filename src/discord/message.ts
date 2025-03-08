import fetch from 'node-fetch'

// Discord API エンドポイント
const DISCORD_API_URL = 'https://discord.com/api/v10'

// Botトークン
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN

/**
 * DiscordメッセージリンクからチャンネルIDとメッセージIDを抽出する
 */
export function parseMessageLink(link: string): { guildId: string, channelId: string, messageId: string } | null {
  try {
    // Discordメッセージリンクの形式: https://discord.com/channels/{guildId}/{channelId}/{messageId}
    const url = new URL(link)
    
    if (!url.hostname.includes('discord.com') || !url.pathname.startsWith('/channels/')) {
      return null
    }
    
    const parts = url.pathname.split('/').filter(Boolean)
    
    if (parts.length !== 4 || parts[0] !== 'channels') {
      return null
    }
    
    return {
      guildId: parts[1],
      channelId: parts[2],
      messageId: parts[3]
    }
  } catch (error) {
    return null
  }
}

/**
 * Discordメッセージの型定義
 */
export interface DiscordMessage {
  id: string
  content: string
  author: {
    id: string
    username: string
    avatar?: string
    global_name?: string
  }
  timestamp: string
  attachments: Array<{
    id: string
    filename: string
    size: number
    url: string
    proxy_url: string
    content_type?: string
    width?: number
    height?: number
  }>
  embeds: Array<any>
  referenced_message?: DiscordMessage
}

/**
 * Discordメッセージを取得する
 */
export async function fetchMessage(
  channelId: string, 
  messageId: string
): Promise<DiscordMessage> {
  const response = await fetch(
    `${DISCORD_API_URL}/channels/${channelId}/messages/${messageId}`,
    {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to fetch message: ${error}`)
  }

  return response.json()
}

/**
 * メッセージの前後のメッセージを取得する
 */
export async function fetchMessageContext(
  channelId: string,
  messageId: string,
  limit: number = 5
): Promise<DiscordMessage[]> {
  // メッセージの前のメッセージを取得
  const beforeResponse = await fetch(
    `${DISCORD_API_URL}/channels/${channelId}/messages?before=${messageId}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!beforeResponse.ok) {
    throw new Error(`Failed to fetch messages before: ${await beforeResponse.text()}`)
  }

  const beforeMessages = await beforeResponse.json() as DiscordMessage[]

  // メッセージ自体を取得
  const message = await fetchMessage(channelId, messageId)

  // メッセージの後のメッセージを取得
  const afterResponse = await fetch(
    `${DISCORD_API_URL}/channels/${channelId}/messages?after=${messageId}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!afterResponse.ok) {
    throw new Error(`Failed to fetch messages after: ${await afterResponse.text()}`)
  }

  const afterMessages = await afterResponse.json() as DiscordMessage[]

  // 前のメッセージ + 対象メッセージ + 後のメッセージを結合して返す
  // 前のメッセージは新しい順に取得されるので、逆順にする
  return [...beforeMessages.reverse(), message, ...afterMessages]
}
