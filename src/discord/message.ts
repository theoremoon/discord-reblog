import fetch from 'node-fetch'

// Discord API エンドポイント
const DISCORD_API_URL = 'https://discord.com/api/v10'

// Botトークン
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN

// 必要なギルドID
const REQUIRED_GUILD_ID = process.env.REQUIRED_GUILD_ID

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
 * 特定の方向のメッセージを取得する
 */
export async function fetchMessagesDirection(
  channelId: string,
  referenceId: string,
  direction: 'before' | 'after',
  limit: number = 5,
  beforeId?: string,
  afterId?: string
): Promise<DiscordMessage[]> {
  let url = `${DISCORD_API_URL}/channels/${channelId}/messages?`;
  
  if (direction === 'before') {
    // 前のメッセージを取得
    url += `before=${beforeId || referenceId}&limit=${limit}`;
  } else {
    // 後のメッセージを取得
    url += `after=${afterId || referenceId}&limit=${limit}`;
  }
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch messages ${direction}: ${await response.text()}`);
  }

  const messages = await response.json() as DiscordMessage[];
  
  // 前のメッセージは新しい順に取得されるので、古い順に並べ替える
  if (direction === 'before') {
    return messages.reverse();
  }
  
  // 後のメッセージも新しい順に取得されるので、古い順に並べ替える
  if (direction === 'after') {
    return messages.reverse();
  }
  
  return messages;
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
  const beforeMessages = await fetchMessagesDirection(
    channelId,
    messageId,
    'before',
    limit
  );

  // メッセージ自体を取得
  const message = await fetchMessage(channelId, messageId);

  // メッセージの後のメッセージを取得
  const afterMessages = await fetchMessagesDirection(
    channelId,
    messageId,
    'after',
    limit
  );

  // 前のメッセージ + 対象メッセージ + 後のメッセージを結合して返す
  // 時系列順（古い順）に並べるため、beforeMessages（すでに逆順）、message、afterMessagesの順に結合
  return [...beforeMessages, message, ...afterMessages];
}

/**
 * チャンネルの型定義
 */
export interface DiscordChannel {
  id: string
  name: string
  type: number
  guild_id: string
  parent_id?: string
}

/**
 * ギルドのチャンネル一覧を取得する
 */
export async function fetchGuildChannels(guildId: string): Promise<DiscordChannel[]> {
  const response = await fetch(
    `${DISCORD_API_URL}/guilds/${guildId}/channels`,
    {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to fetch guild channels: ${error}`)
  }

  const channels = await response.json() as DiscordChannel[]
  
  // テキストチャンネルのみをフィルタリング (type 0 = テキストチャンネル)
  return channels.filter(channel => channel.type === 0)
}

/**
 * チャンネルの最新メッセージを取得する
 */
export async function fetchLatestMessages(channelId: string, limit: number = 10): Promise<DiscordMessage[]> {
  const response = await fetch(
    `${DISCORD_API_URL}/channels/${channelId}/messages?limit=${limit}`,
    {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to fetch latest messages: ${error}`)
  }

  const messages = await response.json() as DiscordMessage[]
  
  // 古い順に並べ替える（APIは新しい順で返す）
  return messages.reverse()
}
