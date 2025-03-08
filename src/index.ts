import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { authMiddleware, guildCheckMiddleware, renderLoginPage, renderGuildErrorPage } from './auth/middleware.js'
import { handleCallback } from './auth/discord.js'
import { deleteSession, getSession } from './utils/session.js'
import { parseMessageLink, fetchMessageContext, fetchMessagesDirection } from './discord/message.js'
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
  const error = c.req.query('error')
  
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
        <h2>メッセージを取得</h2>
        <p>Discordのメッセージリンクを入力して、メッセージを取得します。</p>
        
        ${error ? `<p class="error-message">${error}</p>` : ''}
        
        <form action="/fetch-message" method="post" class="message-form">
          <div>
            <input 
              type="text" 
              name="messageLink" 
              placeholder="https://discord.com/channels/000000000000000000/000000000000000000/000000000000000000" 
              class="message-input"
              required
            >
          </div>
          <div>
            <button type="submit" class="submit-button">メッセージを取得</button>
          </div>
        </form>
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
  
  if (!messageLink || typeof messageLink !== 'string') {
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
          }
          .message:last-child {
            border-bottom: none;
          }
          .message.highlight {
            background-color: #f0f7ff;
            border-left: 4px solid #5865F2;
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
          
          <div class="message-container" id="messageContainer">
            ${messages.map(message => `
              <div class="message ${message.id === messageId ? 'highlight' : ''}" data-message-id="${message.id}">
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
              </div>
            `).join('')}
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
            
            // チャンネルIDとメッセージIDを取得
            const channelId = '${channelId}';
            const messageId = '${messageId}';
            
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
