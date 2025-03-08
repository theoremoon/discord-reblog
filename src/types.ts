import type { Context } from 'hono'
import type { Timestamp } from 'firebase/firestore'

// ユーザー情報の型
export interface User {
  id: string
  username: string
  avatar?: string
}

// スター情報の型
export interface Star {
  id?: string
  entryId: string
  userId: string
  username: string
  avatar?: string
  createdAt: Date | Timestamp
}

// Honoのコンテキスト型を拡張
declare module 'hono' {
  interface ContextVariableMap {
    user: User
  }
}
