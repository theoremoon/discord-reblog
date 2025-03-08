import type { FC } from 'hono/jsx'
import type { Star } from '../types.js'

type StarListProps = {
  stars: Star[]
}

export const StarList: FC<StarListProps> = ({ stars }) => {
  return (
    <div className="star-list">
      <h3>スターをつけたユーザー ({stars.length})</h3>
      
      {stars.length > 0 ? (
        <ul className="star-users">
          {stars.map((star) => (
            <li key={star.id} className="star-user">
              <span className="star-username">{star.username}</span>
              <span className="star-date">
                {(star.createdAt instanceof Date 
                  ? star.createdAt 
                  : new Date(star.createdAt.toDate())
                ).toLocaleString('ja-JP')}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-stars">まだスターがついていません</p>
      )}
      
      <style>{`
        .star-list {
          margin-top: 20px;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 8px;
        }
        .star-list h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #5865F2;
          font-size: 1.1rem;
        }
        .star-users {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .star-user {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .star-user:last-child {
          border-bottom: none;
        }
        .star-username {
          font-weight: bold;
        }
        .star-date {
          color: #666;
          font-size: 0.9em;
        }
        .no-stars {
          color: #666;
          font-style: italic;
        }
      `}</style>
    </div>
  )
}
