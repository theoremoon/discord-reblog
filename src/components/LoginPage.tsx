import type { FC } from 'hono/jsx'

type LoginPageProps = {
  authUrl: string
}

export const LoginPage: FC<LoginPageProps> = ({ authUrl }) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Discord ログイン</title>
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
          .login-container {
            text-align: center;
            padding: 2rem;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .login-button {
            display: inline-block;
            background-color: #5865F2;
            color: white;
            padding: 0.8rem 1.5rem;
            border-radius: 4px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 1rem;
            transition: background-color 0.2s;
          }
          .login-button:hover {
            background-color: #4752C4;
          }
        `}</style>
      </head>
      <body>
        <div className="login-container">
          <h1>Discord ログイン</h1>
          <p>続行するにはDiscordアカウントでログインしてください。</p>
          <a href={authUrl} className="login-button">Discordでログイン</a>
        </div>
      </body>
    </html>
  )
}
