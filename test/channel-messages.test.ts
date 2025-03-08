import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchGuildChannels, fetchLatestMessages } from '../src/discord/message.js'
import fetch from 'node-fetch'

// node-fetchをモック化
vi.mock('node-fetch')

describe('チャンネル関連の機能テスト', () => {
  // テスト前にモックをリセット
  beforeEach(() => {
    vi.resetAllMocks()
  })

  // テスト後にモックをリストア
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchGuildChannels', () => {
    it('ギルドのチャンネル一覧を正しく取得できる', async () => {
      // モックレスポンスの準備
      const mockChannels = [
        {
          id: '123456789',
          name: 'general',
          type: 0, // テキストチャンネル
          guild_id: '987654321',
          parent_id: '111111111'
        },
        {
          id: '234567890',
          name: 'voice-chat',
          type: 2, // ボイスチャンネル
          guild_id: '987654321',
          parent_id: '111111111'
        },
        {
          id: '345678901',
          name: 'announcements',
          type: 0, // テキストチャンネル
          guild_id: '987654321',
          parent_id: '222222222'
        }
      ]

      // fetchのモック実装
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockChannels)
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      // 関数を実行
      const result = await fetchGuildChannels('987654321')

      // 期待される結果
      // テキストチャンネル（type: 0）のみがフィルタリングされるはず
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('123456789')
      expect(result[0].name).toBe('general')
      expect(result[1].id).toBe('345678901')
      expect(result[1].name).toBe('announcements')

      // 正しいURLでfetchが呼ばれたか確認
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/guilds/987654321/channels'),
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
        fetchGuildChannels('987654321')
      ).rejects.toThrow('Failed to fetch guild channels: API error')
    })
  })

  describe('fetchLatestMessages', () => {
    it('チャンネルの最新メッセージを正しく取得できる', async () => {
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
          content: '直前のメッセージ',
          author: { id: '1', username: 'user1' },
          timestamp: '2023-01-02T12:05:00.000Z',
          attachments: [],
          embeds: []
        },
        {
          id: '1000', // 最も古いメッセージが最後
          content: '古いメッセージ',
          author: { id: '1', username: 'user1' },
          timestamp: '2023-01-02T12:00:00.000Z',
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
      const result = await fetchLatestMessages('123456789', 3)

      // 期待される結果
      // 古い順に並べ替えられているはず
      expect(result).toHaveLength(3)
      expect(result[0].id).toBe('1000') // 最も古いメッセージが先頭
      expect(result[1].id).toBe('1001') // 次に古いメッセージが次
      expect(result[2].id).toBe('1002') // 最新のメッセージが最後

      // 正しいURLでfetchが呼ばれたか確認
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/channels/123456789/messages?limit=3'),
        expect.any(Object)
      )
    })

    it('limitパラメータが正しく使用される', async () => {
      // モックレスポンスの準備
      const mockMessages = [
        {
          id: '1002',
          content: '最新のメッセージ',
          author: { id: '1', username: 'user1' },
          timestamp: '2023-01-02T12:10:00.000Z',
          attachments: [],
          embeds: []
        },
        {
          id: '1001',
          content: '直前のメッセージ',
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

      // 関数を実行（limit=2を指定）
      const result = await fetchLatestMessages('123456789', 2)

      // 期待される結果
      expect(result).toHaveLength(2)

      // 正しいURLでfetchが呼ばれたか確認
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/channels/123456789/messages?limit=2'),
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
        fetchLatestMessages('123456789', 10)
      ).rejects.toThrow('Failed to fetch latest messages: API error')
    })
  })
})
