import type { FC } from 'hono/jsx'

export const GuildErrorPage: FC = () => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>アクセス制限</title>
        <style>{`
          body {
            font-family: 'Arial', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background-color: #f5f5f5;
          }
          .error-container {
            text-align: center;
            padding: 2rem;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            max-width: 500px;
          }
          .error-icon {
            font-size: 4rem;
            color: #f44336;
            margin-bottom: 1rem;
          }
          .logout-button {
            display: inline-block;
            background-color: #f44336;
            color: white;
            padding: 0.8rem 1.5rem;
            border-radius: 4px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 1rem;
            transition: background-color 0.2s;
          }
          .logout-button:hover {
            background-color: #d32f2f;
          }
        `}</style>
      </head>
      <body>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h1>アクセス制限</h1>
          <p>このアプリケーションを利用するには、特定のDiscordサーバーに参加している必要があります。</p>
          <p>サーバーに参加した後、再度ログインしてください。</p>
          <a href="/logout" className="logout-button">ログアウト</a>
        </div>
      </body>
    </html>
  )
}
