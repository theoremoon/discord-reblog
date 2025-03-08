import type { FC } from 'hono/jsx'

type StarButtonProps = {
  entryId: string
  isStarred: boolean
  starCount: number
}

export const StarButton: FC<StarButtonProps> = ({ entryId, isStarred, starCount }) => {
  return (
    <div className="star-button-container">
      <button
        className={`star-button ${isStarred ? 'starred' : ''}`}
        data-entry-id={entryId}
        data-action={isStarred ? 'remove-star' : 'add-star'}
      >
        <span className="star-icon">{isStarred ? '★' : '☆'}</span>
        <span className="star-count">{starCount}</span>
      </button>
      
      <style>{`
        .star-button-container {
          display: inline-block;
          margin-left: 10px;
        }
        .star-button {
          display: flex;
          align-items: center;
          background: none;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 5px 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .star-button:hover {
          background-color: #f8f8f8;
        }
        .star-button.starred {
          background-color: #fff8e1;
          border-color: #ffd54f;
        }
        .star-icon {
          color: #ffd54f;
          margin-right: 5px;
          font-size: 1.2em;
        }
        .star-count {
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}
