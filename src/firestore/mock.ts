import type { DiscordMessage } from '../discord/message.js'
import type { ReblogEntry } from './index.js'
import type { Star, User } from '../types.js'

// インメモリデータストア
const reblogEntries: ReblogEntry[] = []
const stars: Star[] = []

/**
 * Firestoreのモック実装
 * 開発時に実際のFirestoreに接続せずにテストするために使用
 */
export const mockFirestore = {
  // 初期化
  init() {
    // データをクリア
    reblogEntries.length = 0
    stars.length = 0
  },

  // クリーンアップ
  cleanup() {
    this.init()
  }
}

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
        createdAt: entry.createdAt instanceof Date ? entry.createdAt : new Date(),
        starCount: 0
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
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date()
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date()
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

  // IDを指定してReblogエントリを取得する
  static async getReblogEntryById(id: string): Promise<ReblogEntry | null> {
    try {
      const entry = reblogEntries.find(entry => entry.id === id)
      return entry || null
    } catch (error) {
      console.error('[FirestoreMock] Reblogエントリの取得に失敗しました:', error)
      throw error
    }
  }

  // スターを追加する
  static async addStar(entryId: string, user: User): Promise<string> {
    try {
      // 既存のスターをチェック
      const existingStar = await this.getUserStarForEntry(entryId, user.id)
      if (existingStar) {
        return existingStar.id!
      }

      // スターを追加
      const star: Star = {
        id: `star-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        entryId,
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
        createdAt: new Date()
      }
      
      stars.push(star)
      
      // エントリのスター数を更新
      await this.updateStarCount(entryId)
      
      return star.id!
    } catch (error) {
      console.error('[FirestoreMock] スターの追加に失敗しました:', error)
      throw error
    }
  }

  // スターを削除する
  static async removeStar(entryId: string, userId: string): Promise<void> {
    try {
      const star = await this.getUserStarForEntry(entryId, userId)
      if (star && star.id) {
        const index = stars.findIndex(s => s.id === star.id)
        if (index !== -1) {
          stars.splice(index, 1)
        }
        
        // エントリのスター数を更新
        await this.updateStarCount(entryId)
      }
    } catch (error) {
      console.error('[FirestoreMock] スターの削除に失敗しました:', error)
      throw error
    }
  }

  // エントリのスター数を更新する
  static async updateStarCount(entryId: string): Promise<void> {
    try {
      const entryStars = await this.getStarsByEntryId(entryId)
      const entry = reblogEntries.find(e => e.id === entryId)
      if (entry) {
        entry.starCount = entryStars.length
      }
    } catch (error) {
      console.error('[FirestoreMock] スター数の更新に失敗しました:', error)
      throw error
    }
  }

  // エントリのスターを取得する
  static async getStarsByEntryId(entryId: string): Promise<Star[]> {
    try {
      return stars.filter(star => star.entryId === entryId)
    } catch (error) {
      console.error('[FirestoreMock] スターの取得に失敗しました:', error)
      throw error
    }
  }

  // ユーザーがエントリにつけたスターを取得する
  static async getUserStarForEntry(entryId: string, userId: string): Promise<Star | null> {
    try {
      const star = stars.find(s => s.entryId === entryId && s.userId === userId)
      return star || null
    } catch (error) {
      console.error('[FirestoreMock] ユーザースターの取得に失敗しました:', error)
      throw error
    }
  }

  // ユーザーがスターをつけたエントリを取得する
  static async getStarredEntriesByUserId(userId: string): Promise<ReblogEntry[]> {
    try {
      // ユーザーのスターを取得
      const userStars = stars.filter(star => star.userId === userId)
      
      // スターがついているエントリを取得
      const entries: ReblogEntry[] = []
      for (const star of userStars) {
        const entry = await this.getReblogEntryById(star.entryId)
        if (entry) {
          entries.push(entry)
        }
      }
      
      return entries
    } catch (error) {
      console.error('[FirestoreMock] スター付きエントリの取得に失敗しました:', error)
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
        createdAt: new Date(),
        createdByUserId: 'user1',
        createdByUsername: 'testuser',
        messages: sampleMessages,
        starCount: 0
      }
      
      reblogEntries.push(sampleEntry)
      console.log('[FirestoreMock] サンプルデータを追加しました')
    }
  }
}
