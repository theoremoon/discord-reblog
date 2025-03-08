import type { FC } from 'hono/jsx'

type LayoutProps = {
  title: string
  children: any
}

export const Layout: FC<LayoutProps> = ({ title, children }) => {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
