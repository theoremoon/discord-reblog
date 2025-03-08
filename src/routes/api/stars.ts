import type { Context } from 'hono'
import { getSession } from '../../utils/session.js'
import { addStar, removeStar, getStarsByEntryId } from '../../firestore/index.js'

// スターを追加するハンドラー
export async function handleAddStar(c: Context) {
  const session = getSession(c)
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const user = c.get('user')
  const { entryId } = await c.req.json()
  
  if (!entryId || typeof entryId !== 'string') {
    return c.json({ error: '必須項目が不足しています' }, 400)
  }
  
  try {
    const starId = await addStar(entryId, user)
    return c.json({ id: starId })
  } catch (error) {
    console.error('スター追加エラー:', error)
    return c.json({ error: 'スターの追加に失敗しました' }, 500)
  }
}

// スターを削除するハンドラー
export async function handleRemoveStar(c: Context) {
  const session = getSession(c)
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const user = c.get('user')
  const { entryId } = await c.req.json()
  
  if (!entryId || typeof entryId !== 'string') {
    return c.json({ error: '必須項目が不足しています' }, 400)
  }
  
  try {
    await removeStar(entryId, user.id)
    return c.json({ success: true })
  } catch (error) {
    console.error('スター削除エラー:', error)
    return c.json({ error: 'スターの削除に失敗しました' }, 500)
  }
}

// エントリのスター一覧を取得するハンドラー
export async function handleGetStars(c: Context) {
  const session = getSession(c)
  if (!session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const entryId = c.req.param('id')
  
  try {
    const stars = await getStarsByEntryId(entryId)
    return c.json({ stars })
  } catch (error) {
    console.error('スター取得エラー:', error)
    return c.json({ error: 'スターの取得に失敗しました' }, 500)
  }
}
