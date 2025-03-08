import type { Context } from 'hono'

// ユーザー情報の型
export interface User {
  id: string
  username: string
  avatar?: string
}

// Honoのコンテキスト型を拡張
declare module 'hono' {
  interface ContextVariableMap {
    user: User
  }
}
