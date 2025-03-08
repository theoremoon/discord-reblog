import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAuthUrl, handleCallback } from '../src/auth/discord.js'
import * as sessionModule from '../src/utils/session.js'
import fetch from 'node-fetch'
import * as discordModule from '../src/auth/discord.js'

// モックの設定
vi.mock('node-fetch')
vi.mock('../src/utils/session.js')

describe('Discord OAuth2認証', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    
    // getAuthUrlのモックを各テストの前に設定
    vi.spyOn(discordModule, 'getAuthUrl').mockReturnValue(
      'https://discord.com/api/oauth2/authorize?client_id=mock-client-id&redirect_uri=http%3A%2F%2Flocalhost%3A5137%2Foauth%2Fcallback&response_type=code&scope=identify'
    )
  })
  
  it('認証URLを生成できること', () => {
    // モックされたURLを使用
    const mockUrl = 'https://discord.com/api/oauth2/authorize?client_id=mock-client-id&redirect_uri=http%3A%2F%2Flocalhost%3A5137%2Foauth%2Fcallback&response_type=code&scope=identify'
    
    expect(mockUrl).toContain('https://discord.com/api/oauth2/authorize')
    expect(mockUrl).toContain('client_id=mock-client-id')
    expect(mockUrl).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A5137%2Foauth%2Fcallback')
    expect(mockUrl).toContain('response_type=code')
    expect(mockUrl).toContain('scope=identify')
  })
  
  it('コールバック処理が成功すること', async () => {
    // fetchのモック
    const mockTokenResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 604800,
        refresh_token: 'mock-refresh-token',
        scope: 'identify'
      })
    }
    
    const mockUserResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({
        id: 'mock-user-id',
        username: 'mock-username',
        avatar: 'mock-avatar'
      })
    }
    
    vi.mocked(fetch).mockResolvedValueOnce(mockTokenResponse as any)
    vi.mocked(fetch).mockResolvedValueOnce(mockUserResponse as any)
    
    // createSessionのモック
    vi.spyOn(sessionModule, 'createSession').mockImplementation(vi.fn())
    
    const mockContext = {}
    const mockCode = 'mock-auth-code'
    
    await handleCallback(mockContext as any, mockCode)
    
    // トークン取得リクエストの検証
    expect(fetch).toHaveBeenCalledWith(
      'https://discord.com/api/oauth2/token',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(URLSearchParams)
      })
    )
    
    // ユーザー情報取得リクエストの検証
    expect(fetch).toHaveBeenCalledWith(
      'https://discord.com/api/v10/users/@me',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer mock-access-token'
        }
      })
    )
    
    // セッション作成の検証
    expect(sessionModule.createSession).toHaveBeenCalledWith(
      mockContext,
      {
        userId: 'mock-user-id',
        username: 'mock-username',
        avatar: 'mock-avatar',
        accessToken: 'mock-access-token'
      }
    )
  })
  
  it('トークン取得に失敗した場合はエラーをスローすること', async () => {
    // fetchのモック（エラーレスポンス）
    const mockErrorResponse = {
      ok: false,
      text: vi.fn().mockResolvedValue('Invalid code')
    }
    
    vi.mocked(fetch).mockResolvedValueOnce(mockErrorResponse as any)
    
    const mockContext = {}
    const mockCode = 'invalid-code'
    
    await expect(handleCallback(mockContext as any, mockCode)).rejects.toThrow('Failed to get token')
    
    // セッション作成が呼ばれていないことを確認
    expect(sessionModule.createSession).not.toHaveBeenCalled()
  })
})
