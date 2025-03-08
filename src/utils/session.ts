import type { Context } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'

// セッションの型定義
export interface Session {
  userId: string
  username: string
  avatar?: string
  accessToken: string
  expiresAt: number
}

// セッションキー
const SESSION_COOKIE_KEY = 'discord_session'

// セッションの有効期限（1日）
const SESSION_EXPIRY = 24 * 60 * 60 * 1000

/**
 * セッションを作成する
 */
export function createSession(c: Context, session: Omit<Session, 'expiresAt'>): void {
  const expiresAt = Date.now() + SESSION_EXPIRY
  const sessionData: Session = {
    ...session,
    expiresAt
  }

  // セッションをクッキーに保存
  setCookie(c, SESSION_COOKIE_KEY, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_EXPIRY / 1000 // 秒単位
  })
}

/**
 * セッションを取得する
 */
export function getSession(c: Context): Session | null {
  const sessionCookie = getCookie(c, SESSION_COOKIE_KEY)
  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie) as Session
    
    // セッションの有効期限をチェック
    if (session.expiresAt < Date.now()) {
      // 有効期限切れの場合はセッションを削除
      deleteSession(c)
      return null
    }
    
    return session
  } catch (error) {
    // JSONパースエラーの場合はセッションを削除
    deleteSession(c)
    return null
  }
}

/**
 * セッションを削除する
 */
export function deleteSession(c: Context): void {
  setCookie(c, SESSION_COOKIE_KEY, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  })
}
