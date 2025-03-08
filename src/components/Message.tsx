import type { FC } from 'hono/jsx'
import type { DiscordMessage } from '../discord/message.js'

type MessageProps = {
  message: DiscordMessage
  isHighlighted?: boolean
  showCheckbox?: boolean
  onCheckboxChange?: (messageId: string, checked: boolean) => void
}

export const Message: FC<MessageProps> = ({ 
  message, 
  isHighlighted = false,
  showCheckbox = false,
  onCheckboxChange
}) => {
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

  const handleCheckboxChange = (e: any) => {
    if (onCheckboxChange) {
      onCheckboxChange(message.id, e.target.checked)
    }
  }

  return (
    <div className={`message ${isHighlighted ? 'highlight' : ''}`} data-message-id={message.id}>
      {showCheckbox && (
        <input 
          type="checkbox" 
          className="message-checkbox" 
          data-message-id={message.id}
          onChange={handleCheckboxChange}
        />
      )}
      <div className="message-header">
        {message.author.avatar && (
          <img 
            src={`https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`} 
            alt="Avatar" 
            className="message-avatar" 
          />
        )}
        <span className="message-author">{message.author.global_name || message.author.username}</span>
        <span className="message-timestamp">{new Date(message.timestamp).toLocaleString('ja-JP')}</span>
      </div>
      <div 
        className="message-content"
        dangerouslySetInnerHTML={{ 
          __html: message.content 
            ? escapeHtml(message.content) 
            : '<em>メッセージ内容がありません</em>' 
        }}
      />
      
      {message.attachments.length > 0 && (
        <div className="message-attachments">
          {message.attachments.map((attachment, index) => (
            <div key={index} className="message-attachment">
              {attachment.content_type?.startsWith('image/') ? (
                <img src={attachment.url} alt={attachment.filename} />
              ) : (
                <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                  {attachment.filename}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
      
      {message.reactions && message.reactions.length > 0 && (
        <div className="message-reactions">
          {message.reactions.map((reaction, index) => {
            // カスタム絵文字かどうかで表示を分ける
            const emojiHtml = reaction.emoji.id
              ? <img 
                  className="emoji" 
                  src={`https://cdn.discordapp.com/emojis/${reaction.emoji.id}.png`} 
                  alt={reaction.emoji.name || ''} 
                />
              : reaction.emoji.name;
            
            return (
              <div key={index} className="reaction" title={`${reaction.count}人がリアクション`}>
                {emojiHtml} <span className="reaction-count">{reaction.count}</span>
              </div>
            );
          })}
        </div>
      )}
      
      {isHighlighted && (
        <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#666' }}>
          メッセージID: {message.id}
        </div>
      )}
    </div>
  )
}
