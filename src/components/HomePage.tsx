import type { FC } from 'hono/jsx'
import type { User } from '../types.js'
import type { DiscordChannel } from '../discord/message.js'
import { Layout } from './Layout.js'
import { Header } from './Header.js'
import { GlobalStyles } from './GlobalStyles.js'

type HomePageProps = {
  user: User
  channels: DiscordChannel[]
  error?: string
}

export const HomePage: FC<HomePageProps> = ({ user, channels, error }) => {
  // Helper function to escape HTML
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>')
  }

  return (
    <Layout title="Discord Reblog">
      <GlobalStyles />
      <Header user={user} />
      <main>
        <h2>メッセージを取得</h2>
        
        {error && <p className="error-message">{error}</p>}
        
        <div className="form-section">
          <h3>メッセージリンクから取得</h3>
          <p>Discordのメッセージリンクを入力して、メッセージを取得します。</p>
          <form action="/fetch-message" method="post" className="message-form">
            <div>
              <input 
                type="text" 
                name="messageLink" 
                placeholder="https://discord.com/channels/000000000000000000/000000000000000000/000000000000000000" 
                className="message-input"
              />
            </div>
            <div>
              <button type="submit" className="submit-button">メッセージを取得</button>
            </div>
          </form>
        </div>
        
        <div className="or-divider">または</div>
        
        <div className="form-section">
          <h3>チャンネルから最新メッセージを取得</h3>
          <p>チャンネルを選択して、最新の10件のメッセージを取得します。</p>
          <form action="/fetch-latest-messages" method="post" className="message-form">
            <div>
              <select name="channelId" className="channel-select" required>
                <option value="">チャンネルを選択してください</option>
                {channels.map(channel => (
                  <option key={channel.id} value={channel.id}>
                    {escapeHtml(channel.name)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button type="submit" className="submit-button">最新メッセージを取得</button>
            </div>
          </form>
        </div>
      </main>
    </Layout>
  )
}
