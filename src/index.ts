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

// ログインページ
app.get('/login', handleLoginPage)

// ログアウト
app.get('/logout', handleLogout)

// OAuth2コールバック
app.get('/oauth/callback', handleOAuthCallback)

// ギルドエラーページ
app.get('/guild-error', handleGuildErrorPage)

// 認証が必要なルート
// すべてのルートに認証ミドルウェアを適用
app.use('/*', authMiddleware)

// ギルドチェックが必要なルート
// 保護されたルートにギルドチェックミドルウェアを適用
app.use('/', guildCheckMiddleware)

// トップページ
app.get('/', handleHomePage)

// メッセージ取得処理
app.post('/fetch-message', handleFetchMessage)

// 最新メッセージ取得処理
app.post('/fetch-latest-messages', handleFetchLatestMessages)

// 前のメッセージを取得するAPI
app.get('/api/messages/:channelId/:messageId/before', handleFetchMessagesBefore)

// 後のメッセージを取得するAPI
app.get('/api/messages/:channelId/:messageId/after', handleFetchMessagesAfter)

// メッセージ表示ページ
app.get('/messages/:channelId/:messageId', handleMessagePage)

// Reblog作成処理
app.post('/create-reblog', handleCreateReblog)

// Reblog一覧ページ（月別アーカイブ）
app.get('/reblog', handleReblogListPage)

// Reblog詳細ページ
app.get('/reblog/:id', handleReblogDetailPage)

// サーバーの起動
serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
