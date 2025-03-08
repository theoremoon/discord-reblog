import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { authMiddleware, guildCheckMiddleware, renderLoginPage, renderGuildErrorPage } from './auth/middleware.js'
import { handleCallback } from './auth/discord.js'
import { deleteSession, getSession } from './utils/session.js'
import './types.js'

// 環境変数からポート番号を取得
const PORT = parseInt(process.env.PORT || '3000', 10)

// アプリケーションの作成
const app = new Hono()

// ミドルウェアの設定
app.use('*', logger())

// ログインページ
app.get('/login', (c) => {
  // すでにログインしている場合はトップページにリダイレクト
  const session = getSession(c)
  if (session) {
    return c.redirect('/')
  }
  
  return renderLoginPage(c)
})

// ログアウト
app.get('/logout', (c) => {
  deleteSession(c)
  return c.redirect('/login')
})

// OAuth2コールバック
app.get('/oauth/callback', async (c) => {
  const code = c.req.query('code')
  
  if (!code) {
    return c.text('認証コードがありません', 400)
  }
  
  try {
    await handleCallback(c, code)
    return c.redirect('/')
  } catch (error) {
    console.error('認証エラー:', error)
    return c.text('認証に失敗しました', 500)
  }
})

// ギルドエラーページ
app.get('/guild-error', (c) => {
  return renderGuildErrorPage(c)
})

// 認証が必要なルート
// すべてのルートに認証ミドルウェアを適用
app.use('/*', authMiddleware)

// ギルドチェックが必要なルート
// 保護されたルートにギルドチェックミドルウェアを適用
app.use('/', guildCheckMiddleware)

// トップページ
app.get('/', (c) => {
  const user = c.get('user')
  
  return c.html(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Discord Reblog</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eee;
        }
        .user-info {
          display: flex;
          align-items: center;
        }
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          margin-right: 1rem;
        }
        .logout-button {
          background-color: #f44336;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <header>
        <h1>Discord Reblog</h1>
        <div class="user-info">
          ${user.avatar 
            ? `<img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" alt="Avatar" class="user-avatar">` 
            : ''}
          <span>${user.username}</span>
          <a href="/logout" class="logout-button" style="margin-left: 1rem;">ログアウト</a>
        </div>
      </header>
      <main>
        <h2>ようこそ！</h2>
        <p>Discordアカウントでログインしました。</p>
      </main>
    </body>
    </html>
  `)
})

// サーバーの起動
serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
