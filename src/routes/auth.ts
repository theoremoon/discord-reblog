import type { Context } from 'hono'
import { deleteSession, getSession } from '../utils/session.js'
import { handleCallback as processCallback } from '../auth/discord.js'
import { renderLoginPage, renderGuildErrorPage } from '../auth/middleware.js'

/**
 * ログインページのハンドラー
 */
export function handleLoginPage(c: Context) {
  // すでにログインしている場合はトップページにリダイレクト
  const session = getSession(c)
  if (session) {
    return c.redirect('/')
  }
  
  return renderLoginPage(c)
}

/**
 * ログアウトのハンドラー
 */
export function handleLogout(c: Context) {
  deleteSession(c)
  return c.redirect('/login')
}

/**
 * OAuth2コールバックのハンドラー
 */
export async function handleOAuthCallback(c: Context) {
  const code = c.req.query('code')
  
  if (!code) {
    return c.text('認証コードがありません', 400)
  }
  
  try {
    await processCallback(c, code)
    return c.redirect('/')
  } catch (error) {
    console.error('認証エラー:', error)
    return c.text('認証に失敗しました', 500)
  }
}

/**
 * ギルドエラーページのハンドラー
 */
export function handleGuildErrorPage(c: Context) {
  return renderGuildErrorPage(c)
}
