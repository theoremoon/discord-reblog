import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { authMiddleware, guildCheckMiddleware } from './auth/middleware.js'
import { handleLoginPage, handleLogout, handleOAuthCallback, handleGuildErrorPage } from './routes/auth.js'
import { handleHomePage } from './routes/index.js'
import { handleFetchMessage, handleFetchLatestMessages, handleMessagePage } from './routes/messages.js'
import { handleCreateReblog, handleReblogListPage, handleReblogDetailPage } from './routes/reblog.js'
import { handleFetchMessagesBefore, handleFetchMessagesAfter } from './routes/api/messages.js'
import './types.js'

// 環境変数からポート番号を取得
const PORT = parseInt(process.env.PORT || '3000', 10)

// アプリケーションの作成
const app = new Hono()

// ミドルウェアの設定
app.use('*', logger())

// 認証関連のルート（認証不要）
app.get('/auth/login', handleLoginPage)
app.get('/auth/logout', handleLogout)
app.get('/auth/callback', handleOAuthCallback)
app.get('/auth/guild-error', handleGuildErrorPage)

// 認証が必要なルート
// すべてのルートに認証ミドルウェアを適用
app.use('/*', authMiddleware)

// ギルドチェックが必要なルート
// 保護されたルートにギルドチェックミドルウェアを適用
app.use('/', guildCheckMiddleware)

// ページ表示ルート
app.get('/', handleHomePage)
app.get('/messages/:channelId/:messageId', handleMessagePage)
app.get('/reblog', handleReblogListPage)
app.get('/reblog/:id', handleReblogDetailPage)

// API ルート - メッセージ関連
app.post('/api/messages/fetch', handleFetchMessage)
app.post('/api/messages/fetch-latest', handleFetchLatestMessages)
app.get('/api/messages/:channelId/:messageId/before', handleFetchMessagesBefore)
app.get('/api/messages/:channelId/:messageId/after', handleFetchMessagesAfter)

// API ルート - Reblog関連
app.post('/api/reblog/create', handleCreateReblog)

// サーバーの起動
serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
