import type { Context } from 'hono'
import { getSession } from '../utils/session.js'
import { getStarredEntriesByUserId } from '../firestore/index.js'
import { renderStarredEntriesPage } from '../components/renderers.js'

/**
 * スター付きエントリ一覧ページのハンドラー
 */
export async function handleStarredEntriesPage(c: Context) {
  const session = getSession(c)
  if (!session) {
    return c.redirect('/login')
  }
  
  const user = c.get('user')
  
  try {
    // ユーザーがスターをつけたエントリの一覧を取得
    const entries = await getStarredEntriesByUserId(user.id)
    
    return c.html(renderStarredEntriesPage(user, entries))
  } catch (error) {
    console.error('スター付きエントリ一覧取得エラー:', error)
    return c.redirect('/?error=' + encodeURIComponent('スター付きエントリ一覧の取得に失敗しました'))
  }
}
