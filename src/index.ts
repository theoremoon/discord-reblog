import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { authMiddleware, guildCheckMiddleware, renderLoginPage, renderGuildErrorPage } from './auth/middleware.js'
import { handleCallback } from './auth/discord.js'
import { deleteSession, getSession } from './utils/session.js'
import { parseMessageLink, fetchMessageContext, fetchMessagesDirection, fetchGuildChannels, fetchLatestMessages, fetchMessage } from './discord/message.js'
import type { DiscordChannel, DiscordMessage } from './discord/message.js'
import { getReblogEntries } from './firestore/index.js'
import { createReblogEntry, renderMessageHtml } from './reblog/index.js'
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
        .message-form {
          margin-bottom: 2rem;
        }
        .message-input {
          width: 100%;
          padding: 0.5rem;
          font-size: 1rem;
          margin-bottom: 1rem;
        }
        .submit-button {
          background-color: #5865F2;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }
        .error-message {
          color: #f44336;
          margin-bottom: 1rem;
        }
        .form-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          border: 1px solid #eee;
          border-radius: 8px;
          background-color: #f9f9f9;
        }
        .form-section h3 {
          margin-top: 0;
        }
        .channel-select {
          width: 100%;
          padding: 0.5rem;
          font-size: 1rem;
          margin-bottom: 1rem;
        }
        .or-divider {
          display: flex;
          align-items: center;
          margin: 2rem 0;
          color: #666;
        }
        .or-divider::before,
        .or-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #ddd;
        }
        .or-divider::before {
          margin-right: 1rem;
        }
        .or-divider::after {
          margin-left: 1rem;
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
          <a href="/reblog" style="margin-left: 1rem; text-decoration: none; color: #5865F2;">Reblogタイムライン</a>
          <a href="/logout" class="logout-button" style="margin-left: 1rem;">ログアウト</a>
        </div>
      </header>
      <main>
        <h2>メッセージを取得</h2>
        
        ${error ? `<p class="error-message">${error}</p>` : ''}
        
        <div class="form-section">
          <h3>メッセージリンクから取得</h3>
          <p>Discordのメッセージリンクを入力して、メッセージを取得します。</p>
          <form action="/fetch-message" method="post" class="message-form">
            <div>
              <input 
                type="text" 
                name="messageLink" 
                placeholder="https://discord.com/channels/000000000000000000/000000000000000000/000000000000000000" 
                class="message-input"
              >
            </div>
            <div>
              <button type="submit" class="submit-button">メッセージを取得</button>
            </div>
          </form>
        </div>
        
        <div class="or-divider">または</div>
        
        <div class="form-section">
          <h3>チャンネルから最新メッセージを取得</h3>
          <p>チャンネルを選択して、最新の10件のメッセージを取得します。</p>
          <form action="/fetch-latest-messages" method="post" class="message-form">
            <div>
              <select name="channelId" class="channel-select" required>
                <option value="">チャンネルを選択してください</option>
                ${channels.map(channel => `<option value="${channel.id}">${escapeHtml(channel.name)}</option>`).join('')}
              </select>
            </div>
            <div>
              <button type="submit" class="submit-button">最新メッセージを取得</button>
            </div>
          </form>
        </div>
      </main>
    </body>
    </html>
  `)
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
    
    return c.html(`
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Discord Reblog - メッセージ</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background-color: #f9f9f9;
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
          .logout-button, .back-button, .reblog-button {
            background-color: #5865F2;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            margin-left: 1rem;
          }
          .logout-button {
            background-color: #f44336;
          }
          .reblog-button {
            background-color: #43b581;
          }
          .reblog-button:disabled {
            background-color: #a0d8bc;
            cursor: not-allowed;
          }
          .message-container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 1rem;
            margin-bottom: 2rem;
          }
          .message {
            padding: 1rem;
            border-bottom: 1px solid #eee;
            position: relative;
          }
          .message:last-child {
            border-bottom: none;
          }
          .message.highlight {
            background-color: #f0f7ff;
            border-left: 4px solid #5865F2;
          }
          .message.selected {
            background-color: #e3f2fd;
          }
          .message-checkbox {
            position: absolute;
            top: 1rem;
            right: 1rem;
          }
          .message-header {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
          }
          .message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            margin-right: 0.5rem;
          }
          .message-author {
            font-weight: bold;
            margin-right: 0.5rem;
          }
          .message-timestamp {
            color: #666;
            font-size: 0.8rem;
          }
          .message-content {
            white-space: pre-wrap;
            word-break: break-word;
          }
          .message-attachments {
            margin-top: 0.5rem;
          }
          .message-attachment {
            display: block;
            margin-top: 0.5rem;
          }
          .message-attachment img {
            max-width: 100%;
            max-height: 300px;
            border-radius: 4px;
          }
          .message-reactions {
            display: flex;
            flex-wrap: wrap;
            margin-top: 0.5rem;
          }
          .reaction {
            display: flex;
            align-items: center;
            background-color: #f2f3f5;
            border-radius: 4px;
            padding: 0.25rem 0.5rem;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
          }
          .reaction .emoji {
            width: 20px;
            height: 20px;
            margin-right: 0.25rem;
          }
          .reaction-count {
            color: #666;
            margin-left: 0.25rem;
          }
          .load-more-container {
            text-align: center;
            margin: 1rem 0;
          }
          .load-more-button {
            background-color: #5865F2;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
          }
          .load-more-button:hover {
            background-color: #4752C4;
          }
          .load-more-button:disabled {
            background-color: #99A0E8;
            cursor: not-allowed;
          }
          .loading-indicator {
            margin-top: 0.5rem;
            color: #666;
          }
          .reblog-form-container {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 1000;
            justify-content: center;
            align-items: center;
          }
          .reblog-form {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            padding: 2rem;
            width: 80%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
          }
          .reblog-form h3 {
            margin-top: 0;
          }
          .form-group {
            margin-bottom: 1rem;
          }
          .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: bold;
          }
          .form-group input, .form-group textarea {
            width: 100%;
            padding: 0.5rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
          }
          .form-group textarea {
            min-height: 100px;
          }
          .form-buttons {
            display: flex;
            justify-content: flex-end;
            margin-top: 1rem;
          }
          .form-buttons button {
            margin-left: 0.5rem;
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .cancel-button {
            background-color: #f2f3f5;
            color: #333;
          }
          .submit-button {
            background-color: #43b581;
            color: white;
          }
          .selected-messages {
            margin-top: 1rem;
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 0.5rem;
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
            <a href="/" class="back-button">戻る</a>
            <a href="/logout" class="logout-button">ログアウト</a>
          </div>
        </header>
        <main>
          <h2>メッセージ</h2>
          
          <div class="load-more-container top">
            <button id="loadMoreBefore" class="load-more-button">過去のメッセージをもっと読み込む</button>
            <div id="loadingBefore" class="loading-indicator" style="display: none;">読み込み中...</div>
          </div>
          
          <div class="actions-container" style="margin-bottom: 1rem;">
            <button id="reblogButton" class="reblog-button" disabled>選択したメッセージをReblog</button>
            <span id="selectedCount" style="margin-left: 1rem; color: #666;">0件選択中</span>
          </div>
          
          <div class="message-container" id="messageContainer">
            ${messages.map(message => `
              <div class="message ${message.id === messageId ? 'highlight' : ''}" data-message-id="${message.id}">
                <input type="checkbox" class="message-checkbox" data-message-id="${message.id}">
                <div class="message-header">
                  ${message.author.avatar 
                    ? `<img src="https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png" alt="Avatar" class="message-avatar">` 
                    : ''}
                  <span class="message-author">${message.author.global_name || message.author.username}</span>
                  <span class="message-timestamp">${new Date(message.timestamp).toLocaleString('ja-JP')}</span>
                </div>
                <div class="message-content">
                  ${message.content ? escapeHtml(message.content) : '<em>メッセージ内容がありません</em>'}
                  ${message.id === messageId ? `<div style="margin-top: 10px; font-size: 0.8rem; color: #666;">メッセージID: ${message.id}</div>` : ''}
                </div>
                ${message.attachments.length > 0 ? `
                  <div class="message-attachments">
                    ${message.attachments.map(attachment => `
                      <div class="message-attachment">
                        ${attachment.content_type?.startsWith('image/') 
                          ? `<img src="${attachment.url}" alt="${attachment.filename}">`
                          : `<a href="${attachment.url}" target="_blank">${attachment.filename}</a>`
                        }
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
                ${message.reactions && message.reactions.length > 0 ? `
                  <div class="message-reactions">
                    ${message.reactions.map(reaction => {
                      // カスタム絵文字かどうかで表示を分ける
                      const emojiHtml = reaction.emoji.id
                        ? `<img class="emoji" src="https://cdn.discordapp.com/emojis/${reaction.emoji.id}.png" alt="${reaction.emoji.name}">`
                        : reaction.emoji.name;
                      
                      return `
                        <div class="reaction" title="${reaction.count}人がリアクション">
                          ${emojiHtml} <span class="reaction-count">${reaction.count}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
          
          <!-- Reblogフォーム -->
          <div class="reblog-form-container" id="reblogFormContainer">
            <div class="reblog-form">
              <h3>Reblogエントリの作成</h3>
              <form id="reblogForm" action="/create-reblog" method="post">
                <div class="form-group">
                  <label for="title">タイトル</label>
                  <input type="text" id="title" name="title" required>
                </div>
                <div class="form-group">
                  <label for="description">説明</label>
                  <textarea id="description" name="description"></textarea>
                </div>
                <div class="form-group">
                  <label>選択したメッセージ</label>
                  <div class="selected-messages" id="selectedMessages"></div>
                  <input type="hidden" id="messageIds" name="messageIds">
                  <input type="hidden" id="channelId" name="channelId" value="${channelId}">
                </div>
                <div class="form-buttons">
                  <button type="button" class="cancel-button" id="cancelButton">キャンセル</button>
                  <button type="submit" class="submit-button">保存</button>
                </div>
              </form>
            </div>
          </div>
          
          <div class="load-more-container bottom">
            <button id="loadMoreAfter" class="load-more-button">新しいメッセージをもっと読み込む</button>
            <div id="loadingAfter" class="loading-indicator" style="display: none;">読み込み中...</div>
          </div>
        </main>
        
        <script>
          // メッセージの継ぎ足し読み込み用のJavaScript
          document.addEventListener('DOMContentLoaded', () => {
            const messageContainer = document.getElementById('messageContainer');
            const loadMoreBefore = document.getElementById('loadMoreBefore');
            const loadMoreAfter = document.getElementById('loadMoreAfter');
            const loadingBefore = document.getElementById('loadingBefore');
            const loadingAfter = document.getElementById('loadingAfter');
            const reblogButton = document.getElementById('reblogButton');
            const selectedCount = document.getElementById('selectedCount');
            const reblogFormContainer = document.getElementById('reblogFormContainer');
            const cancelButton = document.getElementById('cancelButton');
            const reblogForm = document.getElementById('reblogForm');
            const messageIdsInput = document.getElementById('messageIds');
            const selectedMessagesContainer = document.getElementById('selectedMessages');
            
            // チャンネルIDとメッセージIDを取得
            const channelId = '${channelId}';
            const messageId = '${messageId}';
            
            // 選択されたメッセージを追跡
            const selectedMessages = new Set();
            
            // 最初と最後のメッセージIDを追跡
            let firstMessageId = '';
            let lastMessageId = '';
            
            // 初期化時に最初と最後のメッセージIDを設定
            function initializeMessageIds() {
              const messages = document.querySelectorAll('.message');
              if (messages.length > 0) {
                firstMessageId = messages[0].getAttribute('data-message-id');
                lastMessageId = messages[messages.length - 1].getAttribute('data-message-id');
              }
            }
            
            // メッセージ選択の処理
            function setupMessageSelection() {
              // 既存のチェックボックスにイベントリスナーを設定
              document.querySelectorAll('.message-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', handleCheckboxChange);
              });
              
              // メッセージクリックでもチェックボックスを切り替え
              document.querySelectorAll('.message').forEach(message => {
                message.addEventListener('click', (event) => {
                  // チェックボックス自体のクリックは除外
                  if (event.target.classList.contains('message-checkbox')) {
                    return;
                  }
                  
                  // メッセージ内のリンクやボタンのクリックは除外
                  if (event.target.tagName === 'A' || event.target.tagName === 'BUTTON' || 
                      event.target.closest('a') || event.target.closest('button')) {
                    return;
                  }
                  
                  const messageId = message.getAttribute('data-message-id');
                  const checkbox = message.querySelector('.message-checkbox');
                  checkbox.checked = !checkbox.checked;
                  
                  // チェックボックスの変更イベントを発火
                  const changeEvent = new Event('change');
                  checkbox.dispatchEvent(changeEvent);
                });
              });
            }
            
            // チェックボックスの変更イベントハンドラ
            function handleCheckboxChange(event) {
              const checkbox = event.target;
              const messageId = checkbox.getAttribute('data-message-id');
              const messageElement = checkbox.closest('.message');
              
              if (checkbox.checked) {
                selectedMessages.add(messageId);
                messageElement.classList.add('selected');
              } else {
                selectedMessages.delete(messageId);
                messageElement.classList.remove('selected');
              }
              
              // 選択数を更新
              selectedCount.textContent = \`\${selectedMessages.size}件選択中\`;
              
              // Reblogボタンの有効/無効を切り替え
              reblogButton.disabled = selectedMessages.size === 0;
            }
            
            // Reblogボタンのクリックイベント
            reblogButton.addEventListener('click', () => {
              if (selectedMessages.size === 0) return;
              
              // 選択されたメッセージIDをフォームに設定
              messageIdsInput.value = Array.from(selectedMessages).join(',');
              
              // 選択されたメッセージのプレビューを表示
              selectedMessagesContainer.innerHTML = '';
              document.querySelectorAll('.message').forEach(message => {
                const messageId = message.getAttribute('data-message-id');
                if (selectedMessages.has(messageId)) {
                  // メッセージの簡易プレビューを作成
                  const author = message.querySelector('.message-author').textContent;
                  const content = message.querySelector('.message-content').textContent;
                  const preview = document.createElement('div');
                  preview.className = 'message-preview';
                  preview.innerHTML = \`<strong>\${author}</strong>: \${content.substring(0, 50)}\${content.length > 50 ? '...' : ''}\`;
                  selectedMessagesContainer.appendChild(preview);
                }
              });
              
              // フォームを表示
              reblogFormContainer.style.display = 'flex';
            });
            
            // キャンセルボタンのクリックイベント
            cancelButton.addEventListener('click', () => {
              reblogFormContainer.style.display = 'none';
            });
            
            // フォーム送信イベント
            reblogForm.addEventListener('submit', async (event) => {
              event.preventDefault();
              
              const formData = new FormData(reblogForm);
              
              try {
                const response = await fetch('/create-reblog', {
                  method: 'POST',
                  body: formData
                });
                
                if (response.ok) {
                  const result = await response.json();
                  window.location.href = \`/reblog/\${result.id}\`;
                } else {
                  const error = await response.text();
                  alert(\`Reblogの作成に失敗しました: \${error}\`);
                }
              } catch (error) {
                console.error('Reblog作成エラー:', error);
                alert('Reblogの作成に失敗しました');
              }
            });
            
            // 過去のメッセージを読み込む
            async function loadMessagesBefore() {
              if (!firstMessageId) return;
              
              loadingBefore.style.display = 'block';
              loadMoreBefore.disabled = true;
              
              try {
                const response = await fetch(\`/api/messages/\${channelId}/\${messageId}/before?before_id=\${firstMessageId}\`);
                const data = await response.json();
                
                if (data.messages && data.messages.length > 0) {
                  // 新しいメッセージをHTMLに変換
                  const messagesHtml = data.messages.map(message => createMessageHtml(message)).join('');
                  
                  // メッセージコンテナの先頭に追加
                  messageContainer.insertAdjacentHTML('afterbegin', messagesHtml);
                  
                  // 最初のメッセージIDを更新
                  firstMessageId = data.messages[0].id;
                  
                  // メッセージが少ない場合はボタンを非表示
                  if (data.messages.length < 5) {
                    loadMoreBefore.style.display = 'none';
                  }
                } else {
                  // これ以上メッセージがない場合はボタンを非表示
                  loadMoreBefore.style.display = 'none';
                }
              } catch (error) {
                console.error('メッセージ読み込みエラー:', error);
                alert('メッセージの読み込みに失敗しました');
              } finally {
                loadingBefore.style.display = 'none';
                loadMoreBefore.disabled = false;
              }
            }
            
            // 新しいメッセージを読み込む
            async function loadMessagesAfter() {
              if (!lastMessageId) return;
              
              loadingAfter.style.display = 'block';
              loadMoreAfter.disabled = true;
              
              try {
                const response = await fetch(\`/api/messages/\${channelId}/\${messageId}/after?after_id=\${lastMessageId}\`);
                const data = await response.json();
                
                if (data.messages && data.messages.length > 0) {
                  // 新しいメッセージをHTMLに変換
                  const messagesHtml = data.messages.map(message => createMessageHtml(message)).join('');
                  
                  // メッセージコンテナの末尾に追加
                  messageContainer.insertAdjacentHTML('beforeend', messagesHtml);
                  
                  // 最後のメッセージIDを更新
                  lastMessageId = data.messages[data.messages.length - 1].id;
                  
                  // メッセージが少ない場合はボタンを非表示
                  if (data.messages.length < 5) {
                    loadMoreAfter.style.display = 'none';
                  }
                } else {
                  // これ以上メッセージがない場合はボタンを非表示
                  loadMoreAfter.style.display = 'none';
                }
              } catch (error) {
                console.error('メッセージ読み込みエラー:', error);
                alert('メッセージの読み込みに失敗しました');
              } finally {
                loadingAfter.style.display = 'none';
                loadMoreAfter.disabled = false;
              }
            }
            
            // メッセージHTMLを生成する関数
            function createMessageHtml(message) {
              return \`
                <div class="message \${message.id === messageId ? 'highlight' : ''}" data-message-id="\${message.id}">
                  <div class="message-header">
                    \${message.author.avatar 
                      ? \`<img src="https://cdn.discordapp.com/avatars/\${message.author.id}/\${message.author.avatar}.png" alt="Avatar" class="message-avatar">\` 
                      : ''}
                    <span class="message-author">\${message.author.global_name || message.author.username}</span>
                    <span class="message-timestamp">\${new Date(message.timestamp).toLocaleString('ja-JP')}</span>
                  </div>
                  <div class="message-content">
                    \${message.content ? escapeHtml(message.content) : '<em>メッセージ内容がありません</em>'}
                    \${message.id === messageId ? \`<div style="margin-top: 10px; font-size: 0.8rem; color: #666;">メッセージID: \${message.id}</div>\` : ''}
                  </div>
                  \${message.attachments.length > 0 ? \`
                    <div class="message-attachments">
                      \${message.attachments.map(attachment => \`
                        <div class="message-attachment">
                          \${attachment.content_type?.startsWith('image/') 
                            ? \`<img src="\${attachment.url}" alt="\${attachment.filename}">\`
                            : \`<a href="\${attachment.url}" target="_blank">\${attachment.filename}</a>\`
                          }
                        </div>
                      \`).join('')}
                    </div>
                  \` : ''}
                </div>
              \`;
            }
            
            // HTMLエスケープ関数（サーバー側と同じ実装）
            function escapeHtml(text) {
              return text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;')
                .replace(/\\n/g, '<br>');
            }
            
            // イベントリスナーを設定
            loadMoreBefore.addEventListener('click', loadMessagesBefore);
            loadMoreAfter.addEventListener('click', loadMessagesAfter);
            
            // 初期化
            initializeMessageIds();
            setupMessageSelection();
          });
        </script>
      </body>
      </html>
    `)
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

// Reblog一覧ページ
app.get('/reblog', async (c) => {
  const session = getSession(c)
  if (!session) {
    return c.redirect('/login')
  }
  
  const user = c.get('user')
  
  try {
    // Reblogエントリの一覧を取得
    const entries = await getReblogEntries()
    
    return c.html(`
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Discord Reblog - タイムライン</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background-color: #f9f9f9;
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
          .logout-button, .back-button {
            background-color: #5865F2;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            text-decoration: none;
            margin-left: 1rem;
          }
          .logout-button {
            background-color: #f44336;
          }
          .reblog-entry {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 1.5rem;
            margin-bottom: 2rem;
          }
          .reblog-header {
            margin-bottom: 1rem;
          }
          .reblog-title {
            font-size: 1.5rem;
            margin: 0 0 0.5rem 0;
          }
          .reblog-description {
            color: #666;
            margin: 0 0 1rem 0;
          }
          .reblog-meta {
            display: flex;
            justify-content: space-between;
            color: #999;
            font-size: 0.9rem;
            margin-bottom: 1rem;
          }
          .message {
            padding: 1rem;
            border-bottom: 1px solid #eee;
          }
          .message:last-child {
            border-bottom: none;
          }
          .message-header {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
          }
          .message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            margin-right: 0.5rem;
          }
          .message-author {
            font-weight: bold;
            margin-right: 0.5rem;
          }
          .message-timestamp {
            color: #666;
            font-size: 0.8rem;
          }
          .message-content {
            white-space: pre-wrap;
            word-break: break-word;
          }
          .message-attachments {
            margin-top: 0.5rem;
          }
          .message-attachment {
            display: block;
            margin-top: 0.5rem;
          }
          .message-attachment img {
            max-width: 100%;
            max-height: 300px;
            border-radius: 4px;
          }
          .message-reactions {
            display: flex;
            flex-wrap: wrap;
            margin-top: 0.5rem;
          }
          .reaction {
            display: flex;
            align-items: center;
            background-color: #f2f3f5;
            border-radius: 4px;
            padding: 0.25rem 0.5rem;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
          }
          .reaction .emoji {
            width: 20px;
            height: 20px;
            margin-right: 0.25rem;
          }
          .reaction-count {
            color: #666;
            margin-left: 0.25rem;
          }
          .no-entries {
            text-align: center;
            padding: 2rem;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
            <a href="/" class="back-button">戻る</a>
            <a href="/logout" class="logout-button">ログアウト</a>
          </div>
        </header>
        <main>
          <h2>Reblogタイムライン</h2>
          
          ${entries.length === 0 ? `
            <div class="no-entries">
              <p>まだReblogエントリがありません。</p>
              <p>メッセージページでメッセージを選択して、Reblogを作成してください。</p>
            </div>
          ` : entries.map(entry => `
            <div class="reblog-entry">
              <div class="reblog-header">
                <h3 class="reblog-title">${escapeHtml(entry.title)}</h3>
                ${entry.description ? `<p class="reblog-description">${escapeHtml(entry.description)}</p>` : ''}
                <div class="reblog-meta">
                  <span>作成者: ${entry.createdByUsername}</span>
                  <span>作成日時: ${entry.createdAt instanceof Date ? entry.createdAt.toLocaleString('ja-JP') : new Date(entry.createdAt.toDate()).toLocaleString('ja-JP')}</span>
                </div>
              </div>
              <div class="messages">
                ${entry.messages.map(message => renderMessageHtml(message)).join('')}
              </div>
            </div>
          `).join('')}
        </main>
      </body>
      </html>
    `)
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
  
  // Reblog一覧ページにリダイレクト
  return c.redirect('/reblog')
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
