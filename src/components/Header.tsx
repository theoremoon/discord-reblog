import type { FC } from 'hono/jsx'
import type { User } from '../types.js'

type HeaderProps = {
  user: User
}

export const Header: FC<HeaderProps> = ({ user }) => {
  return (
    <header>
      <h1><a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Discord Reblog</a></h1>
      <nav className="main-nav">
        <a href="/" className="nav-link">ホーム</a>
        <a href="/reblog" className="nav-link">Reblogタイムライン</a>
      </nav>
      <div className="user-info">
        {user.avatar && (
          <img 
            src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
            alt="Avatar" 
            className="user-avatar" 
          />
        )}
        <span>{user.username}</span>
        <a href="/logout" className="logout-button">ログアウト</a>
      </div>
    </header>
  )
}
