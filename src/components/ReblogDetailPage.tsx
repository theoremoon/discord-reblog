import type { FC } from 'hono/jsx'
import type { User } from '../types.js'
import type { ReblogEntry } from '../firestore/index.js'
import { Layout } from './Layout.js'
import { Header } from './Header.js'
import { GlobalStyles } from './GlobalStyles.js'
import { Message } from './Message.js'

type ReblogDetailPageProps = {
  user: User
  entry: ReblogEntry
}

export const ReblogDetailPage: FC<ReblogDetailPageProps> = ({ user, entry }) => {
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
    <Layout title={`${escapeHtml(entry.title)} - Discord Reblog`}>
      <GlobalStyles />
      <Header user={user} />
      <main>
        <div className="reblog-entry">
          <div className="reblog-header">
            <h2 className="reblog-title">{escapeHtml(entry.title)}</h2>
            {entry.description && (
              <p className="reblog-description">{escapeHtml(entry.description)}</p>
            )}
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
          <div className="messages">
            {entry.messages.map(message => (
              <Message key={message.id} message={message} />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  )
}
