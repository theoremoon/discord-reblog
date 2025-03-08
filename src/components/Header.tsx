import type { FC } from 'hono/jsx'
import type { User } from '../types.js'

type HeaderProps = {
  user: User
  showBackButton?: boolean
  backUrl?: string
}

export const Header: FC<HeaderProps> = ({ 
  user, 
  showBackButton = false, 
  backUrl = '/' 
}) => {
  return (
    <header>
      <h1>Discord Reblog</h1>
      <div className="user-info">
        {user.avatar && (
          <img 
            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
            alt="Avatar" 
            className="user-avatar" 
          />
        )}
        <span>{user.username}</span>
        {showBackButton && (
          <a href={backUrl} className="back-button">戻る</a>
        )}
        <a href="/reblog" style={{ marginLeft: '1rem', textDecoration: 'none', color: '#5865F2' }}>
          Reblogタイムライン
        </a>
        <a href="/logout" className="logout-button">ログアウト</a>
      </div>
    </header>
  )
}
