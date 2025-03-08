import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createSession, getSession, deleteSession } from '../src/utils/session.js'

// モックコンテキスト
const createMockContext = () => {
  const cookies: Record<string, string> = {}
  
  return {
    cookies,
    req: {
      raw: {
        headers: new Headers()
      }
    },
    header: vi.fn(),
    setCookie: vi.fn()
  }
}

// Honoのcookieヘルパーをモック
vi.mock('hono/cookie', () => {
  return {
    getCookie: vi.fn((c, key) => c.cookies[key]),
    setCookie: vi.fn((c, key, value, options) => {
      c.cookies[key] = value
      c.setCookie(key, value, options)
      return {
        header: vi.fn()
      }
    })
  }
})

describe('セッション管理', () => {
  let mockContext: ReturnType<typeof createMockContext>
  
  beforeEach(() => {
    mockContext = createMockContext()
    vi.spyOn(global.Date, 'now').mockImplementation(() => 1000)
  })
  
  it('セッションを作成できること', () => {
    const sessionData = {
      userId: 'user123',
      username: 'testuser',
      avatar: 'avatar123',
      accessToken: 'token123',
      guildIds: ['guild123', 'guild456']
    }
    
    createSession(mockContext as any, sessionData)
    
    expect(mockContext.setCookie).toHaveBeenCalled()
    const cookieKey = mockContext.setCookie.mock.calls[0][0]
    const cookieValue = mockContext.setCookie.mock.calls[0][1]
    
    expect(cookieKey).toBe('discord_session')
    
    const parsedSession = JSON.parse(cookieValue)
    expect(parsedSession).toEqual({
      ...sessionData,
      expiresAt: 1000 + 24 * 60 * 60 * 1000
    })
  })
  
  it('セッションを取得できること', () => {
    const sessionData = {
      userId: 'user123',
      username: 'testuser',
      avatar: 'avatar123',
      accessToken: 'token123',
      expiresAt: 1000 + 24 * 60 * 60 * 1000,
      guildIds: ['guild123', 'guild456']
    }
    
    mockContext.cookies['discord_session'] = JSON.stringify(sessionData)
    
    const session = getSession(mockContext as any)
    
    expect(session).toEqual(sessionData)
  })
  
  it('有効期限切れのセッションを取得しようとすると null が返ること', () => {
    const sessionData = {
      userId: 'user123',
      username: 'testuser',
      avatar: 'avatar123',
      accessToken: 'token123',
      expiresAt: 500, // 現在時刻より前
      guildIds: ['guild123']
    }
    
    mockContext.cookies['discord_session'] = JSON.stringify(sessionData)
    
    const session = getSession(mockContext as any)
    
    expect(session).toBeNull()
    expect(mockContext.setCookie).toHaveBeenCalled() // セッションが削除されたことを確認
  })
  
  it('セッションを削除できること', () => {
    deleteSession(mockContext as any)
    
    expect(mockContext.setCookie).toHaveBeenCalledWith(
      'discord_session',
      '',
      expect.objectContaining({ maxAge: 0 })
    )
  })
})
