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

  // 日付のフォーマット
  const formatDate = (date: Date | any): string => {
    const d = date instanceof Date ? date : new Date(date.toDate())
    return d.toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Layout title={`${escapeHtml(entry.title)} - Discord Reblog`}>
      <GlobalStyles />
      <Header user={user} />
      <main>
        <div className="reblog-entry fade-in">
          <div className="reblog-header">
            <h2 className="reblog-title">{escapeHtml(entry.title)}</h2>
            <div className="reblog-meta">
              <span>
                <i className="meta-icon">👤</i> 
                作成者: {entry.createdByUsername}
              </span>
              <span>
                <i className="meta-icon">🕒</i> 
                作成日時: {formatDate(entry.createdAt)}
              </span>
              <span>
                <i className="meta-icon">💬</i> 
                メッセージ数: {entry.messages.length}件
              </span>
            </div>
          </div>
          
          <div className="messages-container">
            <h3 className="messages-header">保存されたメッセージ</h3>
            <div className="messages">
              {entry.messages.map((message, index) => (
                <div key={message.id} className="message-wrapper fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <Message key={message.id} message={message} />
                </div>
              ))}
            </div>
          </div>
          
          <div className="reblog-footer">
            <a href="/reblog" className="back-button">
              <i className="back-icon">←</i> タイムラインに戻る
            </a>
          </div>
        </div>
      </main>

      <style>{`
        .reblog-entry {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          margin-bottom: 2rem;
        }
        .messages-container {
          padding: 1.2rem;
        }
        .messages-header {
          margin-top: 0;
          margin-bottom: 1.2rem;
          color: #5865F2;
          border-bottom: 2px solid #eee;
          padding-bottom: 0.8rem;
        }
        .messages {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .message-wrapper {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .meta-icon {
          font-style: normal;
          margin-right: 0.3rem;
        }
        .reblog-footer {
          padding: 1.2rem;
          background-color: #f8f9fa;
          border-top: 1px solid #eee;
          text-align: center;
        }
        .back-icon {
          font-style: normal;
          margin-right: 0.3rem;
        }
      `}</style>
    </Layout>
  )
}
