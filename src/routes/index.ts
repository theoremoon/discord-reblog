import type { Context } from 'hono'
import { getSession } from '../utils/session.js'
import { fetchGuildChannels, type DiscordChannel } from '../discord/message.js'
import { renderHomePage } from '../components/renderers.js'

/**
 * トップページのハンドラー
 */
export async function handleHomePage(c: Context) {
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
}
