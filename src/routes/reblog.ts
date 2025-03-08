import type { Context } from 'hono'
import { getSession } from '../utils/session.js'
import { fetchMessage } from '../discord/message.js'
import { getReblogEntries, getReblogEntryById, getUserStarForEntry, getStarsByEntryId } from '../firestore/index.js'
import { createReblogEntry } from '../reblog/index.js'
import { renderReblogListPage, renderReblogDetailPage } from '../components/renderers.js'

/**
 * Reblog作成処理のハンドラー
 */
export async function handleCreateReblog(c: Context) {
  const session = getSession(c)
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const user = c.get('user')
  const { title, messageIds, channelId } = await c.req.parseBody()
  
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
      user
    )
    
    return c.json({ id: reblogId })
  } catch (error) {
    console.error('Reblog作成エラー:', error)
    return c.json({ error: 'Reblogの作成に失敗しました' }, 500)
  }
}

/**
 * Reblog一覧ページのハンドラー
 */
export async function handleReblogListPage(c: Context) {
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
}

/**
 * Reblog詳細ページのハンドラー
 */
export async function handleReblogDetailPage(c: Context) {
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
    
    // ユーザーがスターをつけているか確認
    const userStar = await getUserStarForEntry(id, user.id)
    const isStarred = userStar !== null
    
    // エントリのスター一覧を取得
    const stars = await getStarsByEntryId(id)
    
    return c.html(renderReblogDetailPage(user, entry, isStarred, stars))
  } catch (error) {
    console.error('Reblog詳細取得エラー:', error)
    return c.redirect('/reblog?error=' + encodeURIComponent('Reblogエントリの取得に失敗しました'))
  }
}
