import type { Context } from 'hono'
import { getSession } from '../../utils/session.js'
import { fetchMessagesDirection } from '../../discord/message.js'

/**
 * 前のメッセージを取得するAPIハンドラー
 */
export async function handleFetchMessagesBefore(c: Context) {
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
}

/**
 * 後のメッセージを取得するAPIハンドラー
 */
export async function handleFetchMessagesAfter(c: Context) {
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
}
