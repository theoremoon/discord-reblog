import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchMessagesDirection } from '../src/discord/message.js'
import { clearCache } from '../src/utils/cache.js'
import fetch from 'node-fetch'

// node-fetchをモック化
vi.mock('node-fetch')

describe('fetchMessagesDirection', () => {
  // テスト前にモックをリセットしキャッシュをクリア
  beforeEach(() => {
    vi.resetAllMocks()
    clearCache()
  })

  // テスト後にモックをリストア
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('前方向のメッセージを正しく取得できる', async () => {
    // モックレスポンスの準備
    const mockMessages = [
      {
        id: '999',
        content: '直前のメッセージ',
        author: { id: '1', username: 'user1' },
        timestamp: '2023-01-02T11:55:00.000Z',
        attachments: [],
        embeds: []
      },
      {
        id: '998',
        content: '古いメッセージ',
        author: { id: '1', username: 'user1' },
        timestamp: '2023-01-02T11:50:00.000Z',
        attachments: [],
        embeds: []
      }
    ]

    // fetchのモック実装
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockMessages)
    }
    vi.mocked(fetch).mockResolvedValue(mockResponse as any)

    // 関数を実行
    const result = await fetchMessagesDirection(
      '123456789',
      '1000',
      'before',
      2
    )

    // 期待される結果
    // 前方向のメッセージは逆順になっているはず（古い順）
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('998') // 最も古いメッセージが先頭
    expect(result[1].id).toBe('999') // 次に古いメッセージが次

    // 正しいURLでfetchが呼ばれたか確認
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/channels/123456789/messages?before=1000&limit=2'),
      expect.any(Object)
    )
  })

  it('後方向のメッセージを正しく取得できる', async () => {
    // モックレスポンスの準備
    // Discord APIからの返却順序を再現（新しい順）
    const mockMessages = [
      {
        id: '1002', // 新しいメッセージが先頭
        content: '最新のメッセージ',
        author: { id: '1', username: 'user1' },
        timestamp: '2023-01-02T12:10:00.000Z',
        attachments: [],
        embeds: []
      },
      {
        id: '1001', // 古いメッセージが後ろ
        content: '直後のメッセージ',
        author: { id: '1', username: 'user1' },
        timestamp: '2023-01-02T12:05:00.000Z',
        attachments: [],
        embeds: []
      }
    ]

    // fetchのモック実装
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockMessages)
    }
    vi.mocked(fetch).mockResolvedValue(mockResponse as any)

    // 関数を実行
    const result = await fetchMessagesDirection(
      '123456789',
      '1000',
      'after',
      2
    )

    // 期待される結果
    // 後方向のメッセージは逆順になっているはず（古い順）
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('1001') // 直後のメッセージが先頭（古い方）
    expect(result[1].id).toBe('1002') // 最新のメッセージが次（新しい方）

    // 正しいURLでfetchが呼ばれたか確認
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/channels/123456789/messages?after=1000&limit=2'),
      expect.any(Object)
    )
  })

  it('beforeIdパラメータを使用して前方向のメッセージを取得できる', async () => {
    // モックレスポンスの準備
    const mockMessages = [
      {
        id: '997',
        content: 'さらに古いメッセージ',
        author: { id: '1', username: 'user1' },
        timestamp: '2023-01-02T11:45:00.000Z',
        attachments: [],
        embeds: []
      },
      {
        id: '996',
        content: '最も古いメッセージ',
        author: { id: '1', username: 'user1' },
        timestamp: '2023-01-02T11:40:00.000Z',
        attachments: [],
        embeds: []
      }
    ]

    // fetchのモック実装
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockMessages)
    }
    vi.mocked(fetch).mockResolvedValue(mockResponse as any)

    // 関数を実行（beforeIdを指定）
    const result = await fetchMessagesDirection(
      '123456789',
      '1000',
      'before',
      2,
      '998' // 998より前のメッセージを取得
    )

    // 期待される結果
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('996') // 最も古いメッセージが先頭
    expect(result[1].id).toBe('997') // 次に古いメッセージが次

    // 正しいURLでfetchが呼ばれたか確認
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/channels/123456789/messages?before=998&limit=2'),
      expect.any(Object)
    )
  })

  it('afterIdパラメータを使用して後方向のメッセージを取得できる', async () => {
    // モックレスポンスの準備
    // Discord APIからの返却順序を再現（新しい順）
    const mockMessages = [
      {
        id: '1004', // 新しいメッセージが先頭
        content: '最新のメッセージ',
        author: { id: '1', username: 'user1' },
        timestamp: '2023-01-02T12:20:00.000Z',
        attachments: [],
        embeds: []
      },
      {
        id: '1003', // 古いメッセージが後ろ
        content: 'さらに新しいメッセージ',
        author: { id: '1', username: 'user1' },
        timestamp: '2023-01-02T12:15:00.000Z',
        attachments: [],
        embeds: []
      }
    ]

    // fetchのモック実装
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockMessages)
    }
    vi.mocked(fetch).mockResolvedValue(mockResponse as any)

    // 関数を実行（afterIdを指定）
    const result = await fetchMessagesDirection(
      '123456789',
      '1000',
      'after',
      2,
      undefined,
      '1002' // 1002より後のメッセージを取得
    )

    // 期待される結果
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('1003') // 直後のメッセージが先頭
    expect(result[1].id).toBe('1004') // 最新のメッセージが次

    // 正しいURLでfetchが呼ばれたか確認
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/channels/123456789/messages?after=1002&limit=2'),
      expect.any(Object)
    )
  })

  it('エラーレスポンスを適切に処理する', async () => {
    // エラーレスポンスのモック
    const mockResponse = {
      ok: false,
      text: vi.fn().mockResolvedValue('API error')
    }
    vi.mocked(fetch).mockResolvedValue(mockResponse as any)

    // 関数を実行して例外が発生することを確認
    await expect(
      fetchMessagesDirection('123456789', '1000', 'before', 2)
    ).rejects.toThrow('Failed to fetch messages before: API error')
  })
})
