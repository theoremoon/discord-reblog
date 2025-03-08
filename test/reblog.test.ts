import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createReblogEntry, renderMessageHtml } from '../src/reblog/index.js'
import { saveReblogEntry } from '../src/firestore/index.js'
import type { DiscordMessage } from '../src/discord/message.js'

// Firestoreのモック
vi.mock('../src/firestore/index.js', () => ({
  saveReblogEntry: vi.fn().mockResolvedValue('mock-reblog-id')
}))

describe('Reblog機能', () => {
  // テスト用のメッセージデータ
  const mockMessages: DiscordMessage[] = [
    {
      id: 'message1',
      content: 'テストメッセージ1',
      author: {
        id: 'user1',
        username: 'testuser1',
        global_name: 'Test User 1'
      },
      timestamp: '2025-03-01T10:00:00.000Z',
      attachments: [],
      embeds: [],
      reactions: [
        {
          emoji: {
            id: null,
            name: '👍'
          },
          count: 2,
          users: []
        }
      ]
    },
    {
      id: 'message2',
      content: 'テストメッセージ2',
      author: {
        id: 'user2',
        username: 'testuser2',
        global_name: 'Test User 2'
      },
      timestamp: '2025-03-01T10:05:00.000Z',
      attachments: [
        {
          id: 'attachment1',
          filename: 'test.png',
          size: 1024,
          url: 'https://example.com/test.png',
          proxy_url: 'https://example.com/test.png',
          content_type: 'image/png',
          width: 100,
          height: 100
        }
      ],
      embeds: []
    }
  ]

  // テスト用のユーザーデータ
  const mockUser = {
    id: 'user123',
    username: 'testuser',
    avatar: 'avatar123'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createReblogEntry', () => {
    it('Reblogエントリを作成してFirestoreに保存する', async () => {
      const title = 'テストReblog'
      const description = 'これはテスト用のReblogです'

      const reblogId = await createReblogEntry(mockMessages, title, description, mockUser)

      // saveReblogEntryが正しく呼ばれたか確認
      expect(saveReblogEntry).toHaveBeenCalledTimes(1)
      expect(saveReblogEntry).toHaveBeenCalledWith({
        title,
        description,
        createdAt: expect.any(Date),
        createdByUserId: mockUser.id,
        createdByUsername: mockUser.username,
        messages: expect.arrayContaining(mockMessages)
      })

      // 返り値が正しいか確認
      expect(reblogId).toBe('mock-reblog-id')
    })

    it('メッセージを時系列順に並べ替える', async () => {
      // 順番を入れ替えたメッセージ配列
      const unsortedMessages = [...mockMessages].reverse()

      await createReblogEntry(unsortedMessages, 'テスト', '', mockUser)

      // saveReblogEntryに渡されたメッセージが時系列順になっているか確認
      const savedCall = vi.mocked(saveReblogEntry).mock.calls[0][0]
      expect(savedCall.messages[0].id).toBe('message1') // 古い方が先
      expect(savedCall.messages[1].id).toBe('message2') // 新しい方が後
    })
  })

  describe('renderMessageHtml', () => {
    it('メッセージのHTMLを生成する', () => {
      const html = renderMessageHtml(mockMessages[0])

      // 必要な要素が含まれているか確認
      expect(html).toContain('message-author')
      expect(html).toContain('Test User 1')
      expect(html).toContain('テストメッセージ1')
      expect(html).toContain('message-timestamp')
    })

    it('添付ファイルを含むメッセージのHTMLを生成する', () => {
      const html = renderMessageHtml(mockMessages[1])

      // 添付ファイルの要素が含まれているか確認
      expect(html).toContain('message-attachments')
      expect(html).toContain('test.png')
      expect(html).toContain('<img src="https://example.com/test.png"')
    })

    it('リアクションを含むメッセージのHTMLを生成する', () => {
      const html = renderMessageHtml(mockMessages[0])

      // リアクションの要素が含まれているか確認
      expect(html).toContain('message-reactions')
      expect(html).toContain('👍')
      expect(html).toContain('reaction-count')
      expect(html).toContain('2')
    })

    it('ハイライト表示のHTMLを生成する', () => {
      const html = renderMessageHtml(mockMessages[0], true)

      // ハイライトクラスが含まれているか確認
      expect(html).toContain('class="message highlight"')
    })
  })
})
