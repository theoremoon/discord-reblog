import type { FC } from 'hono/jsx'
import type { User } from '../types.js'
import type { ReblogEntry } from '../firestore/index.js'
import { Layout } from './Layout.js'
import { Header } from './Header.js'
import { GlobalStyles } from './GlobalStyles.js'

type StarredEntriesPageProps = {
  user: User
  entries: ReblogEntry[]
}

export const StarredEntriesPage: FC<StarredEntriesPageProps> = ({ user, entries }) => {
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
    <Layout title="スター付きエントリ - Discord Reblog">
      <GlobalStyles />
      <Header user={user} />
      <main>
        <div className="page-header">
          <h1>
            <i className="page-icon">★</i> スター付きエントリ
          </h1>
          <p className="page-description">
            あなたがスターをつけたエントリの一覧です
          </p>
        </div>
        
        {entries.length > 0 ? (
          <div className="entries-list">
            {entries.map((entry) => (
              <div key={entry.id} className="entry-card fade-in">
                <h2 className="entry-title">
                  <a href={`/reblog/${entry.id}`}>{escapeHtml(entry.title)}</a>
                </h2>
                <div className="entry-meta">
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
                  <span>
                    <i className="meta-icon">★</i> 
                    スター数: {entry.starCount || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-entries">
            <p>スターをつけたエントリはまだありません</p>
            <a href="/reblog" className="browse-link">エントリを探す</a>
          </div>
        )}
      </main>

      <style>{`
        .page-header {
          margin-bottom: 2rem;
          text-align: center;
        }
        .page-icon {
          font-style: normal;
          color: #ffd54f;
        }
        .page-description {
          color: #666;
          margin-top: 0.5rem;
        }
        .entries-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .entry-card {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          padding: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .entry-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        }
        .entry-title {
          margin-top: 0;
          margin-bottom: 1rem;
        }
        .entry-title a {
          color: #5865F2;
          text-decoration: none;
        }
        .entry-title a:hover {
          text-decoration: underline;
        }
        .entry-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          color: #666;
          font-size: 0.9rem;
        }
        .meta-icon {
          font-style: normal;
          margin-right: 0.3rem;
        }
        .no-entries {
          text-align: center;
          padding: 3rem;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .browse-link {
          display: inline-block;
          margin-top: 1rem;
          padding: 0.5rem 1rem;
          background-color: #5865F2;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          transition: background-color 0.2s;
        }
        .browse-link:hover {
          background-color: #4752c4;
        }
      `}</style>
    </Layout>
  )
}
