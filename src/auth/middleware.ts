import type { Context, Next } from 'hono'
import { getSession } from '../utils/session.js'
import { getAuthUrl } from './discord.js'
import type { User } from '../types.js'

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
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Discord ログイン</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f5f5f5;
        }
        .login-container {
          text-align: center;
          padding: 2rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .login-button {
          display: inline-block;
          background-color: #5865F2;
          color: white;
          padding: 0.8rem 1.5rem;
          border-radius: 4px;
          text-decoration: none;
          font-weight: bold;
          margin-top: 1rem;
          transition: background-color 0.2s;
        }
        .login-button:hover {
          background-color: #4752C4;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <h1>Discord ログイン</h1>
        <p>続行するにはDiscordアカウントでログインしてください。</p>
        <a href="${authUrl}" class="login-button">Discordでログイン</a>
      </div>
    </body>
    </html>
  `)
}

/**
 * ギルドエラーページのレンダリング
 */
export function renderGuildErrorPage(c: Context) {
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>アクセス制限</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f5f5f5;
        }
        .error-container {
          text-align: center;
          padding: 2rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          max-width: 500px;
        }
        .error-icon {
          font-size: 4rem;
          color: #f44336;
          margin-bottom: 1rem;
        }
        .logout-button {
          display: inline-block;
          background-color: #f44336;
          color: white;
          padding: 0.8rem 1.5rem;
          border-radius: 4px;
          text-decoration: none;
          font-weight: bold;
          margin-top: 1rem;
          transition: background-color 0.2s;
        }
        .logout-button:hover {
          background-color: #d32f2f;
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <h1>アクセス制限</h1>
        <p>このアプリケーションを利用するには、特定のDiscordサーバーに参加している必要があります。</p>
        <p>サーバーに参加した後、再度ログインしてください。</p>
        <a href="/logout" class="logout-button">ログアウト</a>
      </div>
    </body>
    </html>
  `)
}
