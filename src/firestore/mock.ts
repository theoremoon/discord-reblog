えimport type { DiscordMessage } from '../discord/message.js'
import type { ReblogEntry } from './index.js'

// インメモリデータストア
const reblogEntries: ReblogEntry[] = []

/**
 * Firestoreのモック実装
 * 開発時に実際のFirestoreに接続せずにテストするために使用
 */
export class FirestoreMock {
  // Reblogエントリを保存する
  static async saveReblogEntry(entry: Omit<ReblogEntry, 'id'>): Promise<string> {
    try {
      // IDを生成
      const id = `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      
      // エントリを保存
      const newEntry: ReblogEntry = {
        ...entry,
        id,
        // Dateオブジェクトに変換
        createdAt: entry.createdAt instanceof Date ? entry.createdAt : new Date()
      }
      
      reblogEntries.push(newEntry)
      console.log(`[FirestoreMock] Reblogエントリを保存しました: ${id}`)
      
      return id
    } catch (error) {
      console.error('[FirestoreMock] Reblogエントリの保存に失敗しました:', error)
      throw error
    }
  }

  // Reblogエントリの一覧を取得する
  static async getReblogEntries(entriesLimit: number = 10): Promise<ReblogEntry[]> {
    try {
      // 作成日時の降順でソート
      const sortedEntries = [...reblogEntries].sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
        return dateB.getTime() - dateA.getTime()
      })
      
      // 指定された件数に制限
      const limitedEntries = sortedEntries.slice(0, entriesLimit)
      
      console.log(`[FirestoreMock] ${limitedEntries.length}件のReblogエントリを取得しました`)
      
      return limitedEntries
    } catch (error) {
      console.error('[FirestoreMock] Reblogエントリの取得に失敗しました:', error)
      throw error
    }
  }

  // テスト用のサンプルデータを追加
  static addSampleData() {
    if (reblogEntries.length === 0) {
      const sampleMessages: DiscordMessage[] = [
        {
          id: 'sample1',
          content: 'これはサンプルメッセージです',
          author: {
            id: 'user1',
            username: 'testuser',
            global_name: 'Test User'
          },
          timestamp: new Date().toISOString(),
          attachments: [],
          embeds: []
        }
      ]
      
      const sampleEntry: ReblogEntry = {
        id: 'sample-entry',
        title: 'サンプルReblog',
        description: 'これはサンプルのReblogエントリです',
        createdAt: new Date(),
        createdByUserId: 'user1',
        createdByUsername: 'testuser',
        messages: sampleMessages
      }
      
      reblogEntries.push(sampleEntry)
      console.log('[FirestoreMock] サンプルデータを追加しました')
    }
  }
}
