import type { Context, Next } from 'hono'
import { getSession } from '../utils/session.js'
import { getAuthUrl } from './discord.js'
import type { User } from '../types.js'
import { renderLoginPage as renderLogin, renderGuildErrorPage as renderError } from '../components/renderers.js'

// 必要なギルドID
const REQUIRED_GUILD_ID = process.env.REQUIRED_GUILD_ID

/**
 * 認証ミドルウェア
 * 未認証の場合はログインページにリダイレクトする
 */
export async function authMiddleware(c: Context, next: Next) {
  const session = getSession(c)
  
  // セッションがない場合はログインページにリダイレクト
  if (!session) {
    return c.redirect('/login')
  }
  
  // リクエストにユーザー情報を追加
  c.set('user', {
    id: session.userId,
    username: session.username,
    avatar: session.avatar
  })
  
  await next()
}

/**
 * ギルド所属チェックミドルウェア
 * 必要なギルドに所属していない場合はエラーページにリダイレクトする
 */
export async function guildCheckMiddleware(c: Context, next: Next) {
  const session = getSession(c)
  
  // セッションがない場合は認証ミドルウェアでリダイレクトされるはずなので、
  // ここでは念のためチェックする
  if (!session) {
    return c.redirect('/login')
  }
  
  // ユーザーが必要なギルドに所属しているかチェック
  if (!session.guildIds || !session.guildIds.includes(REQUIRED_GUILD_ID!)) {
    return c.redirect('/guild-error')
  }
  
  await next()
}

/**
 * ログインページのレンダリング
 */
export function renderLoginPage(c: Context) {
  const authUrl = getAuthUrl()
  return c.html(renderLogin(authUrl))
}

/**
 * ギルドエラーページのレンダリング
 */
export function renderGuildErrorPage(c: Context) {
  return c.html(renderError())
}
