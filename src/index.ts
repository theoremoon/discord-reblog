import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { authMiddleware, guildCheckMiddleware, renderLoginPage, renderGuildErrorPage } from './auth/middleware.js'
import { handleCallback } from './auth/discord.js'
import { deleteSession, getSession } from './utils/session.js'
import { parseMessageLink, fetchMessageContext, fetchMessagesDirection, fetchGuildChannels, fetchLatestMessages, fetchMessage } from './discord/message.js'
import type { DiscordChannel, DiscordMessage } from './discord/message.js'
import { getReblogEntries, getReblogEntryById, type ReblogEntry } from './firestore/index.js'
import { createReblogEntry, renderMessageHtml } from './reblog/index.js'
import { renderHomePage, renderMessagePage, renderReblogListPage, renderReblogDetailPage } from './components/renderers.js'
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
app.get('/', async (c) => {
  const user = c.get('user')
  const error = c.req.query('error')
  const session = getSession(c)
  
  // ギルドIDを取得
  const guildId = process.env.REQUIRED_GUILD_ID
  
  // チャンネル一覧を取得
  let channels: DiscordChannel[] = []
  try {
    channels = await fetchGuildChannels(guildId!)
  } catch (error) {
    console.error('チャンネル一覧取得エラー:', error)
  }
  
  return c.html(renderHomePage(user, channels, error || undefined))
})

// メッセージ取得処理
app.post('/fetch-message', async (c) => {
  const session = getSession(c)
  if (!session) {
    return c.redirect('/login')
  }
  
  const { messageLink } = await c.req.parseBody()
  
  if (!messageLink || typeof messageLink !== 'string' || messageLink.trim() === '') {
    return c.redirect('/?error=' + encodeURIComponent('メッセージリンクを入力してください'))
  }
  
  const parsedLink = parseMessageLink(messageLink)
  
  if (!parsedLink) {
    return c.redirect('/?error=' + encodeURIComponent('無効なメッセージリンクです'))
  }
  
  try {
    const messages = await fetchMessageContext(
      parsedLink.channelId,
      parsedLink.messageId
    )
    
    return c.redirect(`/messages/${parsedLink.channelId}/${parsedLink.messageId}`)
  } catch (error) {
    console.error('メッセージ取得エラー:', error)
    return c.redirect('/?error=' + encodeURIComponent('メッセージの取得に失敗しました'))
  }
})

// 最新メッセージ取得処理
app.post('/fetch-latest-messages', async (c) => {
  const session = getSession(c)
  if (!session) {
    return c.redirect('/login')
  }
  
  const { channelId } = await c.req.parseBody()
  
  if (!channelId || typeof channelId !== 'string') {
    return c.redirect('/?error=' + encodeURIComponent('チャンネルを選択してください'))
  }
  
  try {
    // チャンネルの最新メッセージを取得
    const messages = await fetchLatestMessages(channelId, 10)
    
    if (messages.length === 0) {
      return c.redirect('/?error=' + encodeURIComponent('チャンネルにメッセージがありません'))
    }
    
    // 最新メッセージのIDを取得（配列の最後のメッセージが最新）
    const latestMessageId = messages[messages.length - 1].id
    
    return c.redirect(`/messages/${channelId}/${latestMessageId}`)
  } catch (error) {
    console.error('最新メッセージ取得エラー:', error)
    return c.redirect('/?error=' + encodeURIComponent('メッセージの取得に失敗しました'))
  }
})

// 前のメッセージを取得するAPI
app.get('/api/messages/:channelId/:messageId/before', async (c) => {
  const session = getSession(c)
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const channelId = c.req.param('channelId')
  const messageId = c.req.param('messageId')
  const beforeId = c.req.query('before_id') || messageId
  const limit = parseInt(c.req.query('limit') || '5', 10)
  
  try {
    const messages = await fetchMessagesDirection(
      channelId,
      messageId,
      'before',
      limit,
      beforeId
    )
    
    return c.json({ messages })
  } catch (error) {
    console.error('メッセージ取得エラー:', error)
    return c.json({ error: 'Failed to fetch messages' }, 500)
  }
})

// 後のメッセージを取得するAPI
app.get('/api/messages/:channelId/:messageId/after', async (c) => {
  const session = getSession(c)
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const channelId = c.req.param('channelId')
  const messageId = c.req.param('messageId')
  const afterId = c.req.query('after_id') || messageId
  const limit = parseInt(c.req.query('limit') || '5', 10)
  
  try {
    const messages = await fetchMessagesDirection(
      channelId,
      messageId,
      'after',
      limit,
      undefined,
      afterId
    )
    
    return c.json({ messages })
  } catch (error) {
    console.error('メッセージ取得エラー:', error)
    return c.json({ error: 'Failed to fetch messages' }, 500)
  }
})

// メッセージ表示ページ
app.get('/messages/:channelId/:messageId', async (c) => {
  const session = getSession(c)
  if (!session) {
    return c.redirect('/login')
  }
  
  const channelId = c.req.param('channelId')
  const messageId = c.req.param('messageId')
  
  try {
    const messages = await fetchMessageContext(
      channelId,
      messageId
    )
    
    const user = c.get('user')
    
    return c.html(renderMessagePage(user, messages, channelId, messageId))
  } catch (error) {
    console.error('メッセージ表示エラー:', error)
    return c.redirect('/?error=' + encodeURIComponent('メッセージの表示に失敗しました'))
  }
})

// Reblog作成処理
app.post('/create-reblog', async (c) => {
  const session = getSession(c)
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const user = c.get('user')
  const { title, description, messageIds, channelId } = await c.req.parseBody()
  
  if (!title || typeof title !== 'string' || !messageIds || typeof messageIds !== 'string' || !channelId || typeof channelId !== 'string') {
    return c.json({ error: '必須項目が不足しています' }, 400)
  }
  
  try {
    // メッセージIDをカンマ区切りで分割
    const messageIdArray = messageIds.split(',')
    
    if (messageIdArray.length === 0) {
      return c.json({ error: 'メッセージが選択されていません' }, 400)
    }
    
    // 選択されたメッセージを取得
    const messages = []
    for (const messageId of messageIdArray) {
      const message = await fetchMessage(channelId, messageId, true)
      messages.push(message)
    }
    
    // Reblogエントリを作成
    const reblogId = await createReblogEntry(
      messages,
      title,
      description as string || '',
      user
    )
    
    return c.json({ id: reblogId })
  } catch (error) {
    console.error('Reblog作成エラー:', error)
    return c.json({ error: 'Reblogの作成に失敗しました' }, 500)
  }
})

// Reblog一覧ページ（月別アーカイブ）
app.get('/reblog', async (c) => {
  const session = getSession(c)
  if (!session) {
    return c.redirect('/login')
  }
  
  const user = c.get('user')
  
  try {
    // Reblogエントリの一覧を取得
    const entries = await getReblogEntries()
    
    return c.html(renderReblogListPage(user, entries))
  } catch (error) {
    console.error('Reblog一覧取得エラー:', error)
    return c.redirect('/?error=' + encodeURIComponent('Reblog一覧の取得に失敗しました'))
  }
})

// Reblog詳細ページ
app.get('/reblog/:id', async (c) => {
  const session = getSession(c)
  if (!session) {
    return c.redirect('/login')
  }
  
  const user = c.get('user')
  const id = c.req.param('id')
  
  try {
    // IDを指定してReblogエントリを取得
    const entry = await getReblogEntryById(id)
    
    if (!entry) {
      return c.redirect('/reblog?error=' + encodeURIComponent('指定されたReblogエントリが見つかりません'))
    }
    
    return c.html(renderReblogDetailPage(user, entry))
  } catch (error) {
    console.error('Reblog詳細取得エラー:', error)
    return c.redirect('/reblog?error=' + encodeURIComponent('Reblogエントリの取得に失敗しました'))
  }
})

// HTMLエスケープ関数
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>')
}

// サーバーの起動
serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
