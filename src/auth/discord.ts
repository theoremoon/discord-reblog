import fetch from 'node-fetch'
import type { Context } from 'hono'
import { createSession } from '../utils/session.js'

// Discord API エンドポイント
const DISCORD_API_URL = 'https://discord.com/api/v10'
const DISCORD_OAUTH_URL = 'https://discord.com/api/oauth2/authorize'
const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token'

// 環境変数
const CLIENT_ID = process.env.DISCORD_CLIENT_ID
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI

// スコープ
const SCOPES = ['identify', 'guilds', 'messages.read'].join(' ')

/**
 * Discord OAuth2認証URLを生成する
 */
export function getAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID!,
    redirect_uri: REDIRECT_URI!,
    response_type: 'code',
    scope: SCOPES
  })

  return `${DISCORD_OAUTH_URL}?${params.toString()}`
}

/**
 * アクセストークンを取得する
 */
async function getToken(code: string): Promise<{
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}> {
  const params = new URLSearchParams({
    client_id: CLIENT_ID!,
    client_secret: CLIENT_SECRET!,
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI!
  })

  const response = await fetch(DISCORD_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get token: ${error}`)
  }

  return response.json()
}

/**
 * ユーザー情報を取得する
 */
async function getUserInfo(accessToken: string): Promise<{
  id: string
  username: string
  avatar?: string
}> {
  const response = await fetch(`${DISCORD_API_URL}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get user info: ${error}`)
  }

  return response.json()
}

/**
 * ユーザーのギルド（サーバー）一覧を取得する
 */
async function getUserGuilds(accessToken: string): Promise<string[]> {
  const response = await fetch(`${DISCORD_API_URL}/users/@me/guilds`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get user guilds: ${error}`)
  }

  const guilds = await response.json() as Array<{ id: string }>;
  return guilds.map(guild => guild.id);
}

/**
 * OAuth2コールバック処理
 */
export async function handleCallback(c: Context, code: string): Promise<void> {
  try {
    // アクセストークンを取得
    const tokenData = await getToken(code)
    
    // ユーザー情報を取得
    const userData = await getUserInfo(tokenData.access_token)
    
    // ユーザーのギルド一覧を取得
    const guildIds = await getUserGuilds(tokenData.access_token)
    
    // セッションを作成
    createSession(c, {
      userId: userData.id,
      username: userData.username,
      avatar: userData.avatar,
      accessToken: tokenData.access_token,
      guildIds
    })
  } catch (error) {
    console.error('OAuth callback error:', error)
    throw error
  }
}
