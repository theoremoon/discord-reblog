import type { Context } from 'hono'
import { getSession } from '../utils/session.js'
import { 
  parseMessageLink, 
  fetchMessageContext, 
  fetchLatestMessages,
  fetchMessage
} from '../discord/message.js'
import { renderMessagePage } from '../components/renderers.js'

/**
 * メッセージ取得処理のハンドラー
 */
export async function handleFetchMessage(c: Context) {
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
}

/**
 * 最新メッセージ取得処理のハンドラー
 */
export async function handleFetchLatestMessages(c: Context) {
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
}

/**
 * メッセージ表示ページのハンドラー
 */
export async function handleMessagePage(c: Context) {
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
}
