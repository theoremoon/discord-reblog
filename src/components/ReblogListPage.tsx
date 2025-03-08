import type { FC } from 'hono/jsx'
import type { User } from '../types.js'
import type { ReblogEntry } from '../firestore/index.js'
import { Layout } from './Layout.js'
import { Header } from './Header.js'
import { GlobalStyles } from './GlobalStyles.js'

type ReblogListPageProps = {
  user: User
  entries: ReblogEntry[]
  error?: string
}

export const ReblogListPage: FC<ReblogListPageProps> = ({ user, entries, error }) => {
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

  // 月別にエントリをグループ化
  const entriesByMonth: Record<string, ReblogEntry[]> = {}
  
  entries.forEach(entry => {
    const date = entry.createdAt instanceof Date ? entry.createdAt : new Date(entry.createdAt.toDate())
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    
    if (!entriesByMonth[monthKey]) {
      entriesByMonth[monthKey] = []
    }
    
    entriesByMonth[monthKey].push(entry)
  })
  
  // 月のキーを降順（新しい順）にソート
  const sortedMonths = Object.keys(entriesByMonth).sort().reverse()

  return (
    <Layout title="Discord Reblog - タイムライン">
      <GlobalStyles />
      <Header user={user} />
      <main>
        <h2>Reblogタイムライン</h2>
        
        {error && <p className="error-message">{error}</p>}
        
        {entries.length === 0 ? (
          <div className="no-entries">
            <p>まだReblogエントリがありません。</p>
            <p>メッセージページでメッセージを選択して、Reblogを作成してください。</p>
          </div>
        ) : (
          sortedMonths.map((month, monthIndex) => {
            const monthEntries = entriesByMonth[month]
            const [year, monthNum] = month.split('-')
            const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleString('ja-JP', { month: 'long' })
            
            return (
              <div key={month} className="month-section">
                <h3 className="month-header" data-month={month}>{year}年{monthName}</h3>
                <div className="month-content" data-month-content={month}>
                  {monthEntries.map(entry => {
                    // 最初の3つのメッセージだけを表示
                    const previewMessages = entry.messages.slice(0, 3)
                    const remainingCount = entry.messages.length - previewMessages.length
                    
                    return (
                      <div key={entry.id} className="reblog-entry fade-in">
                        <div className="reblog-header">
                          <h3 className="reblog-title">
                            <a href={`/reblog/${entry.id}`}>{escapeHtml(entry.title)}</a>
                          </h3>
                          <div className="reblog-meta">
                            <span>作成者: {entry.createdByUsername}</span>
                            <span>
                              作成日時: {
                                entry.createdAt instanceof Date 
                                  ? entry.createdAt.toLocaleString('ja-JP') 
                                  : new Date(entry.createdAt.toDate()).toLocaleString('ja-JP')
                              }
                            </span>
                          </div>
                        </div>
                        <div className="message-preview">
                          {previewMessages.map((message, index) => {
                            // メッセージの内容を50文字までに制限
                            const content = message.content || '<em>メッセージ内容がありません</em>'
                            const truncatedContent = content.length > 50 ? content.substring(0, 50) + '...' : content
                            
                            return (
                              <div key={message.id} className="preview-message">
                                <div className="preview-message-header">
                                  {message.author.avatar && (
                                    <img 
                                      src={`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`} 
                                      alt="Avatar" 
                                      className="message-avatar" 
                                    />
                                  )}
                                  <strong className="preview-author">{message.author.global_name || message.author.username}</strong>
                                </div>
                                <div className="preview-content" dangerouslySetInnerHTML={{ __html: escapeHtml(truncatedContent) }} />
                                {index < previewMessages.length - 1 && (
                                  <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0.5rem 0' }} />
                                )}
                              </div>
                            )
                          })}
                          
                          {remainingCount > 0 && (
                            <div className="message-preview-count">
                              <a href={`/reblog/${entry.id}`}>他{remainingCount}件のメッセージを表示</a>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </main>

      <script dangerouslySetInnerHTML={{ __html: `
        // 月別セクションの折りたたみ機能
        document.addEventListener('DOMContentLoaded', () => {
          const monthHeaders = document.querySelectorAll('.month-header');
          
          monthHeaders.forEach(header => {
            header.addEventListener('click', () => {
              const month = header.getAttribute('data-month');
              const content = document.querySelector(\`[data-month-content="\${month}"]\`);
              
              header.classList.toggle('collapsed');
              content.classList.toggle('collapsed');
            });
          });
        });
      `}} />
    </Layout>
  )
}
